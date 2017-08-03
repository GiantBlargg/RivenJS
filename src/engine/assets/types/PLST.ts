import { StackResourceLocation, deps } from "./type-handler";
import { readAsArrayBuffer } from "promise-file-reader";
import DataStream from "../data-stream";

export type PLST = Array<{ id: number; left: number; top: number; right: number; bottom: number }>;

export async function handle(data: Blob, loc: StackResourceLocation, deps: deps) {
	let reader = new DataStream(await readAsArrayBuffer(data));

	let bitmaps: PLST = [];
	let numBitmaps = reader.readUint16();
	for (var i = 0; i < numBitmaps; i++) {
		bitmaps[reader.readUint16()] = {
			id: reader.readUint16(),
			left: reader.readUint16(),
			top: reader.readUint16(),
			right: reader.readUint16(),
			bottom: reader.readUint16()
		};
	}
	return bitmaps;

}
