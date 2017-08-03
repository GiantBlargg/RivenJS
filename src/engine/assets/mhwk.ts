import DataStream from "./data-stream";
import assert from "./assert";
import { readAsArrayBuffer } from "promise-file-reader";

interface fileMeta {
	ID: number;
	loc: number;
	size: number;
}

async function sliceLoad(file: Blob, start?: number, length?: number) {
	let end: number | undefined = undefined;
	if (length) { end = (start || 0) + length; }
	return new DataStream(await readAsArrayBuffer(file.slice(start, end)));
}

class MHWKFile {
	protected constructor(private readonly file: Blob, private readonly resourceList: Map<string, fileMeta[]>) { }

	getIDs() {
		let typeIDs = new Map<string, number[]>();

		for (let [key, value] of this.resourceList) {
			let IDs = new Array<number>();
			for (let i in value) {
				IDs.push(parseInt(i));
			}
			typeIDs.set(key, IDs);
		}

		return typeIDs;
	}

	static async factory(file: Blob) {
		const sanityError = "Malformed Header";
		let header = await sliceLoad(file, 0, 28);

		//Sanity Checks
		assert(header.readString(4) == "MHWK", sanityError);
		assert(header.readUint32() + 8 == file.size, sanityError);
		assert(header.readString(4) == "RSRC", sanityError);
		assert(header.readUint16() == 0x100, sanityError);
		header.pos += 2;
		assert(header.readUint32() == file.size);

		let resDirLoc = header.readUint32();

		let fileTblLoc = header.readUint16() + resDirLoc;
		let fileTblSize = header.readUint16();

		let types = new Map<string, fileMeta[]>();

		let fileTbl = await sliceLoad(file, fileTblLoc, fileTblSize);
		let fileNum = fileTbl.getUint32(0);

		//Names are annoying to load and they aren't needed so I don't bother.
		let typeNum = (await sliceLoad(file, resDirLoc + 2, 2)).readUint16();

		let typeTbl = await sliceLoad(file, resDirLoc + 4, 8 * typeNum);
		for (let t = 0; t < typeNum; t++) {
			let typeName = typeTbl.readString(4);

			let resTblLoc = typeTbl.readUint16() + resDirLoc;
			let resNum = (await sliceLoad(file, resTblLoc, 2)).readUint16();
			let resTbl = await sliceLoad(file, resTblLoc + 2, resNum * 4);

			let res = new Array<fileMeta>();
			for (let r = 0; r < resNum; r++) {
				let ID = resTbl.readUint16();
				let index = resTbl.readUint16() - 1;
				assert(index <= fileNum, "Requested file has an out of bounds index");
				fileTbl.pos = index * 10 + 4;
				let loc = fileTbl.readUint32();
				let size = fileTbl.readUint16() + fileTbl.readUint8() * 0x10000;
				res[ID] = { ID: ID, loc: loc, size: size };
			}

			typeTbl.pos += 2;//Skip Name Table Location

			types.set(typeName, res);
		}
		//TODO: the file sizes for tMOVs are often wrong.
		return new MHWKFile(file, types);
	}

	load(ID: number, type: string) {
		let typedList = this.resourceList.get(type);
		if (!typedList) throw new Error("No files of type " + type + "found");

		let fileInfo = typedList[ID]
		if (!fileInfo) throw new Error("No file of ID " + ID + " found.");

		return this.file.slice(fileInfo.loc, fileInfo.loc + fileInfo.size);
	}
}

export default class Stack {
	private readonly IDMap: Map<string, number[]>;

	constructor(private readonly archives: MHWKFile[]) {
		this.IDMap = new Map();
		for (let a = 0; a < archives.length; a++) {
			for (let [t, v] of archives[a].getIDs()) {
				let IDs = new Array<number>();
				for (let i of v) {
					IDs[i] = a;
				}
				this.IDMap.set(t, IDs);
			}
		}
	}

	load(ID: number, type: string) {
		let typedIDMap = this.IDMap.get(type)
		if (!typedIDMap) throw new Error("No files of type " + type + "found");

		return this.archives[typedIDMap[ID]].load(ID, type);
	}

	static async factory(archivePaths: string[], getFile: (file: string, disc?: number) => Promise<Blob>) {
		let archivePromises = new Array<Promise<MHWKFile>>(archivePaths.length);
		for (let f = 0; f < archivePaths.length; f++) {
			archivePromises[f] = new Promise(async function (resolve, reject) {
				try {
					console.log("Loading " + archivePaths[f]);
					resolve(MHWKFile.factory(await getFile(archivePaths[f])));
				} catch (err) {
					reject(err);
				}
			});
		}

		return new Stack(await Promise.all(archivePromises));
	}
}
