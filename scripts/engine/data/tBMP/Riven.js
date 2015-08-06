/**
 * This file contains code based on code liscenced under the GPL.
 *
 * The original can be found at https://github.com/scummvm/scummvm/blob/master/engines/mohawk/bitmap.cpp
 *
 * Until this section is rewritten to not use this code, this file will be licensed seperatly from the rest of this project under the GPL-2.0.
 *
 * Please don't sue me!
 */

define(["engine/data/Binary"], function(Binary) {
	return function(data, width, height, bytesRow) {

		data.setPos(4);

		var decImg = [];

		var subcommand = 0;

		//TODO rewrite to plagerise less
		while (decImg.length < bytesRow * height) {
			var cmd = data.getByte();

			if (subcommand) {
				subcommand--;
				var m = cmd & 15;

				//Arithmetic
				if (cmd >= 1 && cmd <= 15) {// Repeat duplet at relative position of -m duplets
					B_PIXEL_MINUS(m * 2);
					B_PIXEL_MINUS(m * 2);
				} else if (cmd == 16) {// Repeat last duplet, but set the value of the second pixel to p
					B_LASTDUPLET();
					B_BYTE();
				} else if (cmd >= 17 && cmd <= 31) {// Repeat last duplet, but set the value of the second pixel to the value of the -m pixel
					B_LASTDUPLET();
					B_PIXEL_MINUS(m);
				} else if (cmd >= 32 && cmd <= 47) {// Repeat last duplet, but add x to second pixel
					B_LASTDUPLET();
					B_LASTDUPLET_PLUS(m);
				} else if (cmd >= 48 && cmd <= 63) {// Repeat last duplet, but subtract x from second pixel
					B_LASTDUPLET();
					B_LASTDUPLET_MINUS(m);
				} else if (cmd == 64) {// Repeat last duplet, but set the value of the first pixel to p
					B_BYTE();
					B_LASTDUPLET();
				} else if (cmd >= 65 && cmd <= 79) {// Output pixel at relative position -m, then second pixel of last duplet
					B_PIXEL_MINUS(m);
					B_LASTDUPLET();
				} else if (cmd == 80) {// Output two absolute pixel values, p1 and p2
					B_BYTE();
					B_BYTE();
				} else if (cmd >= 81 && cmd <= 87) {// Output pixel at relative position -m, then absolute pixel value p
					B_PIXEL_MINUS(cmd & 7);
					B_BYTE();
				} else if (cmd >= 89 && cmd <= 95) {// Output absolute pixel value p, then pixel at relative position -m
					B_BYTE();
					B_PIXEL_MINUS(cmd & 7);
				} else if (cmd >= 96 && cmd <= 111) {// Output absolute pixel value p, then (second pixel of last duplet) + x
					B_BYTE();
					B_LASTDUPLET_PLUS(m);
				} else if (cmd >= 112 && cmd <= 127) {// Output absolute pixel value p, then (second pixel of last duplet) - x
					B_BYTE();
					B_LASTDUPLET_MINUS(m);
				} else if (cmd >= 128 && cmd <= 143) {// Repeat last duplet adding x to the first pixel
					B_LASTDUPLET_PLUS(m);
					B_LASTDUPLET();
				} else if (cmd >= 144 && cmd <= 159) {// Output (first pixel of last duplet) + x, then absolute pixel value p
					B_LASTDUPLET_PLUS(m);
					B_BYTE();
				} else if (cmd == 160) {// Repeat last duplet, adding first 4 bits of the next byte to first pixel and last 4 bits to second
					var pattern = data.getByte();
					B_LASTDUPLET_PLUS(pattern >> 4);
					B_LASTDUPLET_PLUS(pattern & 15);
				} else if (cmd == 176) {// Repeat last duplet, adding first 4 bits of the next byte to first pixel and subtracting last 4 bits from second
					var pattern = data.getByte();
					B_LASTDUPLET_PLUS(pattern >> 4);
					B_LASTDUPLET_MINUS(pattern & 15);
				} else if (cmd >= 192 && cmd <= 207) {// Repeat last duplet subtracting x from first pixel
					B_LASTDUPLET_MINUS(m);
					B_LASTDUPLET();
				} else if (cmd >= 208 && cmd <= 223) {// Output (first pixel of last duplet) - x, then absolute pixel value p
					B_LASTDUPLET_MINUS(m);
					B_BYTE();
				} else if (cmd == 224) {// Repeat last duplet, subtracting first 4 bits of the next byte to first pixel and adding last 4 bits to second
					var pattern = data.getByte();
					B_LASTDUPLET_MINUS(pattern >> 4);
					B_LASTDUPLET_PLUS(pattern & 15);
				} else if (cmd == 240 || cmd == 255) {// Repeat last duplet, subtracting first 4 bits from the next byte to first pixel and last 4 bits from second
					var pattern = data.getByte();
					B_LASTDUPLET_MINUS(pattern >> 4);
					B_LASTDUPLET_MINUS(pattern & 15);

					// Repeat operations
					// Repeat n duplets from relative position -m (given in pixels, not duplets).
					// If r is 0, another byte follows and the last pixel is set to that value
				} else if (cmd >= 0xa4 && cmd <= 0xa7) {
					B_NDUPLETS(3, cmd);
					B_BYTE();
				} else if (cmd >= 0xa8 && cmd <= 0xab) {
					B_NDUPLETS(4, cmd);
				} else if (cmd >= 0xac && cmd <= 0xaf) {
					B_NDUPLETS(5, cmd);
					B_BYTE();
				} else if (cmd >= 0xb4 && cmd <= 0xb7) {
					B_NDUPLETS(6, cmd);
				} else if (cmd >= 0xb8 && cmd <= 0xbb) {
					B_NDUPLETS(7, cmd);
					B_BYTE();
				} else if (cmd >= 0xbc && cmd <= 0xbf) {
					B_NDUPLETS(8, cmd);
				} else if (cmd >= 0xe4 && cmd <= 0xe7) {
					B_NDUPLETS(9, cmd);
					B_BYTE();
				} else if (cmd >= 0xe8 && cmd <= 0xeb) {
					B_NDUPLETS(10, cmd);
					// 5 duplets
				} else if (cmd >= 0xec && cmd <= 0xef) {
					B_NDUPLETS(11, cmd);
					B_BYTE();
				} else if (cmd >= 0xf4 && cmd <= 0xf7) {
					B_NDUPLETS(12, cmd);
				} else if (cmd >= 0xf8 && cmd <= 0xfb) {
					B_NDUPLETS(13, cmd);
					B_BYTE();
				} else if (cmd == 0xfc) {
					var b1 = data.getByte();
					var b2 = data.getByte();
					var m1 = (((b1 & 3) << 8) + b2);

					for (var j = 0; j < ((b1 >> 3) + 1); j++) {// one less iteration
						B_PIXEL_MINUS(m1);
						B_PIXEL_MINUS(m1);
					}

					// last iteration
					B_PIXEL_MINUS(m1);

					if ((b1 & (1 << 2)) == 0) {
						B_BYTE();
					} else {
						B_PIXEL_MINUS(m1);
					}
				}
			} else {

				if (cmd == 0x00) {// End of stream
					break;
				} else if (cmd >= 0x01 && cmd <= 0x3f) {// Simple Pixel Duplet Output
					for (var i = 0; i < cmd; i++) {
						decImg.push(data.getByte(), data.getByte());
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
					subcommand=cmd - 192;
				}
			}

		}

		function B_BYTE() {
			decImg.push(data.getByte());
		}

		function B_LASTDUPLET() {
			decImg.push(decImg[decImg.length - 2]);
		}

		function B_LASTDUPLET_PLUS(m) {
			decImg.push(decImg[decImg.length - 2] + m);
		}

		function B_LASTDUPLET_MINUS(m) {
			decImg.push(decImg[decImg.length - 2] - m);
		}

		function B_PIXEL_MINUS(m) {
			decImg.push(decImg[decImg.length - m]);
		}

		function B_NDUPLETS(n, cmd) {
			var m1 = ((cmd & 3) << 8) + data.getByte();
			for (var j = 0; j < n; j++) {
				decImg.push(decImg[decImg.length - m1]);
			}
		}

		return decImg;
	};
});
