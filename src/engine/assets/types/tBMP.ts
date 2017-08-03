

import DataStream from "../data-stream";
import { readAsArrayBuffer } from "promise-file-reader";

async function None(file: Blob, width: number, height: number, bytesRow: number) {
	let data = new DataStream(await readAsArrayBuffer(file));
	var result = [];
	for (var i = 0; i < bytesRow * height; i++) {
		result[i] = data.getUint8(i);
	}
	return result;
}

async function Riven(file: Blob, width: number, height: number, bytesRow: number) {
	let data = new DataStream(await readAsArrayBuffer(file));

	data.pos = 4;

	var decImg: number[] = [];

	var subcommand = 0;

	//TODO rewrite to plagerise less
	while (decImg.length < bytesRow * height) {
		var cmd = data.readUint8();

		if (subcommand) {
			subcommand--;
			var m = cmd & 15;

			//Arithmetic
			if (cmd >= 1 && cmd <= 15) {// Repeat duplet at relative position of -m duplets
				_prevPixel(m * 2);
				_prevPixel(m * 2);
			} else if (cmd == 16) {// Repeat last duplet, but set the value of the second pixel to p
				_lastduplet();
				_byte();
			} else if (cmd >= 17 && cmd <= 31) {// Repeat last duplet, but set the value of the second pixel to the value of the -m pixel
				_lastduplet();
				_prevPixel(m);
			} else if (cmd >= 32 && cmd <= 47) {// Repeat last duplet, but add x to second pixel
				_lastduplet();
				_lastduplet(m);
			} else if (cmd >= 48 && cmd <= 63) {// Repeat last duplet, but subtract x from second pixel
				_lastduplet();
				_lastduplet(-m);
			} else if (cmd == 64) {// Repeat last duplet, but set the value of the first pixel to p
				_byte();
				_lastduplet();
			} else if (cmd >= 65 && cmd <= 79) {// Output pixel at relative position -m, then second pixel of last duplet
				_prevPixel(m);
				_lastduplet();
			} else if (cmd == 80) {// Output two absolute pixel values, p1 and p2
				_byte();
				_byte();
			} else if (cmd >= 81 && cmd <= 87) {// Output pixel at relative position -m, then absolute pixel value p
				_prevPixel(cmd & 7);
				_byte();
			} else if (cmd >= 89 && cmd <= 95) {// Output absolute pixel value p, then pixel at relative position -m
				_byte();
				_prevPixel(cmd & 7);
			} else if (cmd >= 96 && cmd <= 111) {// Output absolute pixel value p, then (second pixel of last duplet) + x
				_byte();
				_lastduplet(m);
			} else if (cmd >= 112 && cmd <= 127) {// Output absolute pixel value p, then (second pixel of last duplet) - x
				_byte();
				_lastduplet(-m);
			} else if (cmd >= 128 && cmd <= 143) {// Repeat last duplet adding x to the first pixel
				_lastduplet(m);
				_lastduplet();
			} else if (cmd >= 144 && cmd <= 159) {// Output (first pixel of last duplet) + x, then absolute pixel value p
				_lastduplet(m);
				_byte();
			} else if (cmd == 160) {// Repeat last duplet, adding first 4 bits of the next byte to first pixel and last 4 bits to second
				var pattern = data.readUint8();
				_lastduplet(pattern >> 4);
				_lastduplet(pattern & 15);
			} else if (cmd == 176) {// Repeat last duplet, adding first 4 bits of the next byte to first pixel and subtracting last 4 bits from second
				var pattern = data.readUint8();
				_lastduplet(pattern >> 4);
				_lastduplet(-(pattern & 15));
			} else if (cmd >= 192 && cmd <= 207) {// Repeat last duplet subtracting x from first pixel
				_lastduplet(-m);
				_lastduplet();
			} else if (cmd >= 208 && cmd <= 223) {// Output (first pixel of last duplet) - x, then absolute pixel value p
				_lastduplet(-m);
				_byte();
			} else if (cmd == 224) {// Repeat last duplet, subtracting first 4 bits of the next byte to first pixel and adding last 4 bits to second
				var pattern = data.readUint8();
				_lastduplet(-(pattern >> 4));
				_lastduplet(pattern & 15);
			} else if (cmd == 240 || cmd == 255) {// Repeat last duplet, subtracting first 4 bits from the next byte to first pixel and last 4 bits from second
				var pattern = data.readUint8();
				_lastduplet(-(pattern >> 4));
				_lastduplet(-(pattern & 15));

				// Repeat operations
				// Repeat n duplets from relative position -m (given in pixels, not duplets).
				// If r is 0, another byte follows and the last pixel is set to that value
			} else if (cmd >= 0xa4 && cmd <= 0xa7) {
				B_NDUPLETS(3, cmd);
				_byte();
			} else if (cmd >= 0xa8 && cmd <= 0xab) {
				B_NDUPLETS(4, cmd);
			} else if (cmd >= 0xac && cmd <= 0xaf) {
				B_NDUPLETS(5, cmd);
				_byte();
			} else if (cmd >= 0xb4 && cmd <= 0xb7) {
				B_NDUPLETS(6, cmd);
			} else if (cmd >= 0xb8 && cmd <= 0xbb) {
				B_NDUPLETS(7, cmd);
				_byte();
			} else if (cmd >= 0xbc && cmd <= 0xbf) {
				B_NDUPLETS(8, cmd);
			} else if (cmd >= 0xe4 && cmd <= 0xe7) {
				B_NDUPLETS(9, cmd);
				_byte();
			} else if (cmd >= 0xe8 && cmd <= 0xeb) {
				B_NDUPLETS(10, cmd);
				// 5 duplets
			} else if (cmd >= 0xec && cmd <= 0xef) {
				B_NDUPLETS(11, cmd);
				_byte();
			} else if (cmd >= 0xf4 && cmd <= 0xf7) {
				B_NDUPLETS(12, cmd);
			} else if (cmd >= 0xf8 && cmd <= 0xfb) {
				B_NDUPLETS(13, cmd);
				_byte();
			} else if (cmd == 0xfc) {
				var b1 = data.readUint8();
				var b2 = data.readUint8();
				var m1 = (((b1 & 3) << 8) + b2);

				for (var j = 0; j < ((b1 >> 3) + 1); j++) {// one less iteration
					_prevPixel(m1);
					_prevPixel(m1);
				}

				// last iteration
				_prevPixel(m1);

				if ((b1 & (1 << 2)) == 0) {
					_byte();
				} else {
					_prevPixel(m1);
				}
			}
		} else {

			if (cmd == 0x00) {// End of stream
				break;
			} else if (cmd >= 0x01 && cmd <= 0x3f) {// Simple Pixel Duplet Output
				for (var i = 0; i < cmd; i++) {
					decImg.push(data.readUint8(), data.readUint8());
				}
			} else if (cmd >= 0x40 && cmd <= 0x7f) {// Simple Repetition of last 2 pixels (cmd - 0x40) times
				var pixels = [decImg[decImg.length - 2], decImg[decImg.length - 1]];
				for (var i = 0; i < (cmd - 0x40); i++) {
					decImg.push(pixels[0], pixels[1]);
				}
			} else if (cmd >= 0x80 && cmd <= 0xbf) {// Simple Repetition of last 4 pixels (cmd - 0x80) times
				var pixels = [decImg[decImg.length - 4], decImg[decImg.length - 3], decImg[decImg.length - 2], decImg[decImg.length - 1]];
				for (var i = 0; i < (cmd - 0x80); i++) {
					decImg.push(pixels[0], pixels[1], pixels[2], pixels[3]);
				}
			} else {//Subcommand
				subcommand = cmd - 192;
			}
		}

	}

	function _byte() {
		decImg.push(data.readUint8());
	}

	function _lastduplet(m = 0) {
		decImg.push(decImg[decImg.length - 2] + m);
	}

	function _prevPixel(m: number) {
		decImg.push(decImg[decImg.length - m]);
	}

	function B_NDUPLETS(n: number, cmd: number) {
		var m1 = ((cmd & 3) << 8) + data.readUint8();
		for (var j = 0; j < n; j++) {
			decImg.push(decImg[decImg.length - m1]);
		}
	}

	return decImg;
};
// This emulates byte overflow similar to lower level languages, so 256==0
function bound(array: Array<number>, min?: number, max?: number) {//Might be unnecessary but i'll leave it in for saftey

	min = min || 0;
	max = max || 256;

	for (var i in array) {
		while (array[i] >= max) {
			array[i] -= max;
		}
		while (array[i] < min) {
			array[i] += max;
		}
	}
	return array;
}

function No(): never {
	throw new Error("Not Implemented");
}

var bitDepths = [1, 4, 8, 16, 24];

var Primary = [None, No, No, No, Riven];

var Secondary = [
	function (d: number[], ...dontcare: any[]) {
		return d;
	}, No, No, No];

export default async function (file: Blob) {

	let data = new DataStream(await readAsArrayBuffer(file));

	let starttime = performance.now();

	var width = data.getUint16(0);
	var height = data.getUint16(2);

	var bytesRow = data.getUint16(4);

	var comp = data.getUint16(6);

	var bitDepth = bitDepths[comp & 7];
	var palette: number | { r: number; g: number; b: number; }[] = comp >> 3 & 1;
	var comp2 = comp >> 4 & 15;
	var comp1 = comp >> 8 & 15;

	var imgOff = 8;
	if (palette) {
		imgOff += data.getUint16(8);
		var bitPCol = data.getUint8(10);
		console.assert(bitPCol == 24);
		var numColours = data.getUint8(11) + 1;
		console.assert(numColours == 256);
		palette = [];
		for (var i = 0; i < numColours; i++) {
			var offset = 12 + i * bitPCol / 8;
			palette[i] = {
				r: data.getUint8(offset + 2),
				g: data.getUint8(offset + 1),
				b: data.getUint8(offset)
			};
		}
	}

	var decImg = bound(Secondary[comp2](bound(await Primary[comp1](file.slice(imgOff), width, height, bytesRow)), width, height, bytesRow));

	var finalImg = [];

	for (var pixel in decImg) {
		var colour = (<{ r: number; g: number; b: number; }[]>palette)[decImg[pixel]];
		if (parseInt(pixel) % bytesRow < width) {
			finalImg.push(colour.r, colour.g, colour.b, 255);
		}
	}

	console.log("Image took " + (performance.now() - starttime) + " ms to load.");

	return new ImageData(new Uint8ClampedArray(finalImg), width, height);
}
