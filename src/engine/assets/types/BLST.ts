import DataStream from "../data-stream";
import { readAsArrayBuffer } from "promise-file-reader";

export type BLST = Array<{ enabled: boolean; hotspot_id: number; }>

export async function handle(data: Blob) {
	let reader = new DataStream(await readAsArrayBuffer(data));
	let BLST: BLST = [];
	let numBLST = reader.readUint16();
	for (let i = 0; i < numBLST; i++) {
		BLST[reader.readUint16()] = {
			enabled: !!reader.readUint16(),
			hotspot_id: reader.readUint16()
		};
	}
	return BLST;
}
