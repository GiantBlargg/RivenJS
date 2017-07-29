import DataStream from "./data-stream";
import assert from "./assert";
import * as PromiseFileReader from "promise-file-reader";

interface fileMeta {
	ID: number;
	loc: number;
	size: number;
}

async function sliceLoad(file: Blob, start?: number, length?: number) {
	let end: number | undefined = undefined;
	if (length) { end = (start || 0) + length; }
	return new DataStream(await PromiseFileReader.readAsArrayBuffer(file.slice(start, length)));
}

export default class MHWK {
	protected constructor(private readonly file: Blob, private readonly resourceList: Map<string, fileMeta[]>) { }

	static async factory(file: Blob) {
		const sanityError = "Malformed Header";
		let header = await sliceLoad(file, 0, 28);

		//Sanity Checks
		assert(header.readString(4) == "MHWK", sanityError);
		assert(header.readUint32() + 8 == file.size, sanityError);
		assert(header.readString(4) == "RSRC", sanityError);
		assert(header.readUint16() == 0x100, sanityError);
		header.pos += 2;
		assert(header.readUint16() == file.size);

		let resDirLoc = header.readUint16();

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
				let index = resTbl.readUint16();
				assert(index <= fileNum, "Requested file has an out of bounds index");
				fileTbl.pos = index * 10 + 4;
				let loc = fileTbl.readUint32();
				let size = fileTbl.readUint16() + fileTbl.readUint8() * 0x10000;
				res[ID] = { ID: ID, loc: loc, size: size };
			}

			typeTbl.pos += 4;//Skip Name Table Location

			types.set(typeName, res);
		}
	}
}
