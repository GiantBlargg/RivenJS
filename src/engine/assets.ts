import { StackResourceLocation } from "./assets/types/type-handler";
import types from "./assets/types/types";
import * as ini from "ini";
import * as PromiseFileReader from "promise-file-reader";
import Stack from "./assets/mhwk";
import assert from "./assets/assert";

export interface stackcfg {
	name: string;
	files: string[];
	disc: number;
	ID: number;
}

interface Resource {
	self: StackResourceLocation;
	deps: StackResourceLocation[];
	soon: StackResourceLocation[];
	data: Promise<any>;
}

export default class Assets {

	private readonly cfg: Map<string, stackcfg> = new Map();
	private readonly loadRes: Map<string, Resource> = new Map();
	private readonly depsTreeRoot: StackResourceLocation[] = [];
	private deps: Map<string, StackResourceLocation> = new Map();
	private mhwk: Map<string, Stack> = new Map();

	protected constructor(cfgString: string, iniString: string,
		private readonly getFile: (file: string, disc?: number) => Promise<Blob>) {

		let stackcfg = ini.decode(cfgString.split("; Data file sets")[1]);
		let stackID = ini.decode(iniString)["StackNumber"];
		for (let s in stackcfg) {
			let stack: stackcfg = {
				name: s, files: [], disc: parseInt(stackcfg[s].Disc), ID: parseInt(stackID[s])
			}
			for (let i = 0; stackcfg[s]["File_" + i]; i++) {
				stack.files.push(stackcfg[s]["File_" + i]);
			}
			this.cfg.set(s, stack);
		}
		console.log(this.cfg);
	}

	get(loc: StackResourceLocation) {
		let res = this.loadRes.get(this.stringifyLoc(loc));
		if (res) {
			return res.data;
		}
		else {
			//We'll load the data and store it, but because it isn't in the dependancy tree it'll get cleaned up.
			return this.load(loc).data;
		}
	}

	private async asyncLoad(loc: StackResourceLocation) {
		let that = this;//UGLY, but it's needed.

		let stack = this.mhwk.get(loc.stack);
		if (!stack) {
			let stackcfg = this.cfg.get(loc.stack);
			if (!stackcfg) throw new Error(loc.stack + " is not a recognized stack");
			stack = await Stack.factory(stackcfg.files, this.getFile);
		}
		let processFunc = types.get(loc.type);
		if (!processFunc) throw new Error(loc.type + " is not a recognized type.");

		function deps(soon?: boolean) {
			return function (arg1: StackResourceLocation | number | string,
				arg2?: number | string, arg3?: string) {
				let depLoc = that.resolvePartialLoc(loc, arg1, arg2, arg3);

				let self = <Resource>that.loadRes.get(that.stringifyLoc(loc));
				assert(self, "WTF!");
				(soon ? self.soon : self.deps).push(depLoc);
				that.updatesDeps();
			};
		}

		function get(arg1: StackResourceLocation | number | string,
			arg2?: number | string, arg3?: string) {
			let depLoc = that.resolvePartialLoc(loc, arg1, arg2, arg3);

			return that.get(depLoc);
		}

		return processFunc(stack.load(loc.ID, loc.type), deps(true), deps(false), get);
	}

	private resolvePartialLoc(oldLoc: StackResourceLocation, arg1: StackResourceLocation | number | string,
		arg2?: number | string, arg3?: string) {

		let depLoc: StackResourceLocation;
		if (typeof arg1 == "number") {
			assert(typeof arg2 == "string", "Bad args");
			depLoc = { stack: oldLoc.stack, ID: arg1, type: <string>arg2 };
		} else if (typeof arg1 == "string") {
			assert(typeof arg2 == "number", "Bad args");
			assert(typeof arg3 == "string", "Bad args");
			depLoc = { stack: arg1, ID: <number>arg2, type: <string>arg3 };
		} else {
			//arg1 is a full loc
			depLoc = arg1;
		}
		return depLoc;
	}

	private load(loc: StackResourceLocation) {
		let res: Resource = { self: loc, deps: [], soon: [], data: this.asyncLoad(loc) };
		this.loadRes.set(this.stringifyLoc(loc), res);
		return res;
	}

	private updatesDeps() {
		this.deps = new Map();
		this.crawlDeps(this.depsTreeRoot, 1);//TODO: allow the user to configure the depth.
		this.removeDeps();
	}

	private crawlDeps(root: StackResourceLocation[], depth: number) {
		for (let d of root) {
			let res = this.loadRes.get(this.stringifyLoc(d));
			if (!res) {
				res = this.load(d);
			}
			this.crawlDeps(res.deps, depth);
			if (depth > 0) this.crawlDeps(res.soon, depth - 1);
		}
	}

	private removeDeps() {
		for (let [key, value] of this.loadRes) {
			if (!this.deps.get(key)) this.loadRes.delete(key);
		}
	}

	stringifyLoc(resLoc: StackResourceLocation) {
		//Collisions are possible but unlikely.
		return resLoc.type + resLoc.ID + resLoc.stack;
	}

	static async factory(cfgFile: Blob, iniFile: Blob,
		getFile: (file: string, disc?: number) => Promise<Blob>) {

		return new Assets(await PromiseFileReader.readAsText(cfgFile),
			await PromiseFileReader.readAsText(iniFile), getFile);
	}
}
