declare function require(path: string): any;

import { blobToPtr } from "./emscripten-helper";

function ptrToImageData(ptr: number) {
	let i16 = ptr / 2
	let width = Module.HEAPU16[i16];
	let height = Module.HEAPU16[i16 + 1];
	let size = width * height * 4;
	let array = new Uint8ClampedArray(Module.HEAP8.buffer.slice(ptr + 4, ptr + 4 + size));
	let imageData = new ImageData(array, width, height);
	Module._free(ptr);
	return imageData;
}

export default async function handle(data: Blob) {
	let ptr = await blobToPtr(data);
	let outptr = (<any>Module)._tBMP(ptr, data.size);
	let imagedata = ptrToImageData(outptr);
	return imagedata;
}
