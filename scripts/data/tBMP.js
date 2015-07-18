define(["data/Binary", "data/tBMP/None", "data/tBMP/Riven"], function(Binary, None, Riven) {

	// This emulates byte overflow similar to lower level languages
	function bound(array, min, max) {//Might be unnecessary but i'll leave it in for saftey

		min = min || 0;
		max = max || 256;

		for (i in array) {
			while (array[i] >= max) {
				array[i] -= max;
			}
			while (array[i] < min) {
				array[i] += max;
			}
		}
		return array;
	}

	function No() {
		throw new Error("Not Implemented");
	}

	var bitDepths = [1, 4, 8, 16, 24];

	var Primary = [None, No, No, undefined, Riven];

	var Secondary = [
	function(d) {
		return d;
	}, No, undefined, No];

	return function(data) {

		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext("2d");

		var width = data.getUint16(0);
		var height = data.getUint16(2);

		canvas.width = width;
		canvas.height = height;

		var bytesRow = data.getUint16(4);
		
		console.log(bytesRow);
		
		var comp = data.getUint16(6);

		var bitDepth = bitDepths[comp & 7];
		var palette = comp >> 3 & 1;
		var comp2 = comp >> 4 & 15;
		var comp1 = comp >> 8 & 15;

		var imgOff = 8;
		if (palette) {
			imgOff += data.getUint16(8);
			var bitPCol = data.getUint8(10);
			console.assert(bitPCol == 24);
			var numColours = data.getUint8(11) + 1;
			console.assert(numColours == 256);
			var palette = [];
			for (var i = 0; i < numColours; i++) {
				var offset = 12 + i * bitPCol / 8;
				palette[i] = "rgb(" + data.getUint8(offset + 2) + "," + data.getUint8(offset + 1) + "," + data.getUint8(offset) + ")";
			}
		}

		var decImg = bound(Secondary[comp2](bound(Primary[comp1](data.subs(imgOff), width, height, bytesRow), 0, 256), width, height, bytesRow), 0, 256);

		console.log("decoding complete, coloring");

		drawImg();

		function drawImg() {
			for (pixel in decImg) {
				var row = Math.floor(pixel / bytesRow);
				var c = decImg[pixel];
				drawPixel(pixel - row * bytesRow, row, palette[c], c, pixel);
			}
		}

		function drawPixel(x, y, colour, c, pixel) {
			if ( typeof colour != "string") {
				//throw new Error(colour, c, pixel);
			}
			ctx.fillStyle = colour;
			ctx.fillRect(x, y, 1, 1);
		}

		return canvas;
	};
});
