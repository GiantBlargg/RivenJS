import { StackResourceLocation } from "./assets/types/ITypeHandler";
import * as ini from "ini";

interface stack { name: string; files: string[]; disc: number; }

export default class Data {

	private readonly cfg: Map<string, stack> = new Map<string, stack>();

	constructor(cfgString: string, private readonly want: (file: string, disc?: number) => Promise<Blob>) {
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

	static factory(cfgFile: Blob, want: (file: string, disc?: number) => Promise<Blob>) {
		return new Promise<Data>(function (resolve, reject) {
			let iniReader = new FileReader();
			iniReader.addEventListener("loadend", function (e) {
				if ((<FileReader>e.target).error) {
					reject(new Error("Failed to load cfgFile."));
				} else {
					resolve(new Data((<FileReader>e.target).result, want));
				}
			});
			iniReader.readAsText(cfgFile);
		});

	}

	async load(loc: StackResourceLocation) {
	}
}
