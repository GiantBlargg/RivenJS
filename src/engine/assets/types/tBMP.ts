declare function require(path: string): any;

import { readAsArrayBuffer } from "promise-file-reader";
const tBMP = require("./tBMP.c").default;

async function blobToPtr(m: any, b: Blob) {
	let fileBuffer = await readAsArrayBuffer(b);
	let ptr = m._malloc(b.size);
	m.writeArrayToMemory(new Uint8Array(fileBuffer), ptr);
	return ptr;
}

function ptrToImageData(m: any, ptr: number) {
	let i16 = ptr / 2
	let width = m.HEAPU16[i16];
	let height = m.HEAPU16[i16 + 1];
	let size = width * height * 4;
	let array = new Uint8ClampedArray(m.HEAP8.buffer.slice(ptr + 4, ptr + 4 + size));
	let imageData = new ImageData(array, width, height);
	m._free(ptr);
	return imageData;
}

export default async function handle(data: Blob) {
	let ptr = await blobToPtr(tBMP, data);
	let start = performance.now();
	let outptr = tBMP._tBMP(ptr, data.size);
	console.log("Decoding took %d ms.", performance.now() - start);
	let imagedata = ptrToImageData(tBMP, outptr);
	return 0 || imagedata;
}
