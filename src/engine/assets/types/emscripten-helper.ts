
import { readAsArrayBuffer } from "promise-file-reader";

export async function blobToPtr(b: Blob) {
	let fileBuffer = await readAsArrayBuffer(b);
	let ptr = Module._malloc(b.size);
	Module.HEAP8.set(new Uint8Array(fileBuffer), ptr); 1
	return ptr;
}
