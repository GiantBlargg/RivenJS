import DataStream from "../data-stream";
import { readAsArrayBuffer } from "promise-file-reader";
import assert from "../assert";
import { blobToPtr } from "./emscripten-helper";

export default async function tWAV(data: Blob) {
	let ptr = await blobToPtr(data);
	let outptr = (<any>Module)._tWAV(ptr, data.size);
	return outptr;
}
