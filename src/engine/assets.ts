import { StackResourceLocation, Resource } from "./assets/types/type-handler";
import * as ini from "ini";
import * as PromiseFileReader from "promise-file-reader";

export interface stackcfg {
	name: string;
	files: string[];
	disc: number;
}

export default class Assets {

	private readonly cfg: Map<string, stackcfg> = new Map();
	private readonly loadRes: Map<string, Resource> = new Map();

	protected constructor(cfgString: string,
		private readonly getFile: (file: string, disc?: number) => Promise<Blob>) {

		let result = ini.decode(cfgString.split("; Data file sets")[1]);
		for (let s in result) {
			let stack: stackcfg = {
				name: s, files: [], disc: result[s].Disc
			}
			for (let i = 0; result[s]["File_" + i]; i++) {
				stack.files.push(result[s]["File_" + i]);
			}
			this.cfg.set(s, stack);
		}
		console.log(this.cfg);
	}

	get(loc: StackResourceLocation) {
		let res = this.loadRes.get(stringifyLoc(loc));
		if (res) {
			return res.data;
		}
		else {
			return this.load(loc).data;
		}
	}

	private load(loc: StackResourceLocation) {
		let p = new Promise<any>(function (resolve, reject) {
			//TODO: Actually load the resource
		});
		let res: Resource = { self: loc, deps: [], soon: [], data: p };
		this.loadRes.set(stringifyLoc(loc), res);
		return res;
	}

	static async factory(cfgFile: Blob, getFile: (file: string, disc?: number) => Promise<Blob>) {
		return new Assets(await PromiseFileReader.readAsText(cfgFile), getFile);
	}
}

function stringifyLoc(resLoc: StackResourceLocation) {
	//Collisions are possible but unlikely.
	return resLoc.type + resLoc.ID + resLoc.stack;
}
