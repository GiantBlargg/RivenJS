import "./Binary";
import None from "./tBMP/None";
import Riven from "./tBMP/Riven";
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

var Primary = [None, No, No, undefined, Riven];

var Secondary = [
	function (d, ...dontcare) {
		return d;
	}, No, undefined, No];

export default function (data) {

	var width = data.getUint16(0);
	var height = data.getUint16(2);

	var bytesRow = data.getUint16(4);

	var comp = data.getUint16(6);

	var bitDepth = bitDepths[comp & 7];
	var palette: number | { r; g; b; }[] = comp >> 3 & 1;
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

	var decImg = bound(Secondary[comp2](bound(Primary[comp1](data.subs(imgOff), width, height, bytesRow)), width, height, bytesRow));

	var finalImg = [];

	for (var pixel in decImg) {
		var colour = palette[decImg[pixel]];
		if (parseInt(pixel) % bytesRow < width) {
			finalImg.push(colour.r, colour.g, colour.b, 255);
		}
	}

	return new ImageData(new Uint8ClampedArray(finalImg), width, height);
}
