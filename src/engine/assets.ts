import { StackResourceLocation } from "./assets/types/type-handler";
import * as ini from "ini";
import * as PromiseFileReader from "promise-file-reader";

interface stack { name: string; files: string[]; disc: number; }

export default class Assets {

	private readonly cfg: Map<string, stack> = new Map<string, stack>();

	protected constructor(cfgString: string, private readonly want: (file: string, disc?: number) => Promise<Blob>) {
		let result = ini.decode(cfgString.split("; Data file sets")[1]);
		for (let s in result) {
			let stack: stack = {
				name: s, files: [], disc: result[s].Disc
			}
			for (let i = 0; result[s]["File_" + i]; i++) {
				stack.files.push(result[s]["File_" + i]);
			}
			this.cfg.set(s, stack);
		}
		console.log(this.cfg);
	}

	static async factory(cfgFile: Blob, want: (file: string, disc?: number) => Promise<Blob>) {
		return new Assets(await PromiseFileReader.readAsText(cfgFile), want);

	}

	async load(loc: StackResourceLocation) {
	}
}
