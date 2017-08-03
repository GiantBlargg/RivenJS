import { TypeHandler } from "./type-handler";
import { readAsArrayBuffer } from "promise-file-reader";
import DataStream from "../data-stream";

let types = new Map<string, TypeHandler>();

types.set("BLST", async function (data: Blob) {
	let reader = new DataStream(await readAsArrayBuffer(data));
	let BLST = [];
	let numBLST = reader.readUint16();
	for (let i = 0; i < numBLST; i++) {
		BLST[reader.readUint16()] = {
			enable: reader.readUint16(),
			hotspot_id: reader.readUint16()
		};
	}
	return BLST;
});

export default types;
