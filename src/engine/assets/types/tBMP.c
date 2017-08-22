#include <emscripten.h>
#include <endian.h>
#include <stdint.h>
#include <stdlib.h>

#define readUint8(ptr)                                                         \
	*(uint8_t *)ptr;                                                           \
	ptr += 1

#define readUint16BE(ptr)                                                      \
	be16toh(*(uint16_t *)ptr);                                                 \
	ptr += 2

#define FM_BITDEPTH 0b111
#define FM_PALETTE 0b1000
#define FM_1COMP 0xf00
#define FM_2COMP 0xf0

#define COMP_NONE 0
#define COMP_RLE8 0x10
#define COMP_LZ 0x100
#define COMP_RIVEN 0x400

struct colour {
	uint8_t red;
	uint8_t green;
	uint8_t blue;
};

static uint8_t getLastTwoBits(uint8_t c) { return (c & 0x03); }

static uint8_t getLastThreeBits(uint8_t c) { return (c & 0x07); }

static uint8_t getLastFourBits(uint8_t c) { return (c & 0x0f); }

#define B_BYTE()                                                               \
	*ptr = readUint8(data);                                                    \
	ptr++

#define B_LASTDUPLET()                                                         \
	*ptr = *(ptr - 2);                                                         \
	ptr++

#define B_LASTDUPLET_PLUS_M()                                                  \
	*ptr = *(ptr - 2) + m;                                                     \
	ptr++

#define B_LASTDUPLET_MINUS_M()                                                 \
	*ptr = *(ptr - 2) - m;                                                     \
	ptr++

#define B_LASTDUPLET_PLUS(m)                                                   \
	*ptr = *(ptr - 2) + (m);                                                   \
	ptr++

#define B_LASTDUPLET_MINUS(m)                                                  \
	*ptr = *(ptr - 2) - (m);                                                   \
	ptr++

#define B_PIXEL_MINUS(m)                                                       \
	*ptr = *(ptr - (m));                                                       \
	ptr++

#define B_NDUPLETS(n)                                                          \
	uint8_t r = readUint8(data);                                               \
	uint16_t m1 = ((getLastTwoBits(cmd) << 8) + r);                            \
	for (uint16_t j = 0; j < (n); j++) {                                       \
		*ptr = *(ptr - m1);                                                    \
		ptr++;                                                                 \
	}                                                                          \
	void dummyFuncToAllowTrailingSemicolon()

uint8_t *decompRiven(void *data, uint32_t insize, uint32_t outsize) {
	void *start = data;
	data += 4;
	uint8_t *out = malloc(outsize);
	uint8_t *ptr = out;

	while (data < (start + insize) && ptr < (out + outsize)) {
		uint8_t cmd = readUint8(data);

		if (cmd == 0x00) { // End of Stream
			break;
		} else if (cmd >= 0x01 && cmd <= 0x3f) { // Output the next cmd duplets
			for (uint8_t i = 0; i < cmd; i++) {
				*ptr++ = readUint8(data);
				*ptr++ = readUint8(data);
			}
		} else if (cmd >= 0x40 && cmd <= 0x7f) {
			uint8_t pixels[] = {*(ptr - 2), *(ptr - 1)};
			for (uint8_t i = 0; i < (cmd - 0x40); i++) {
				*ptr++ = pixels[0];
				*ptr++ = pixels[1];
			}
		} else if (cmd >= 0x80 && cmd <= 0xbf) {
			uint8_t pixels[] = {*(ptr - 4), *(ptr - 3), *(ptr - 2), *(ptr - 1)};
			for (uint8_t i = 0; i < (cmd - 0x80); i++) {
				*ptr++ = pixels[0];
				*ptr++ = pixels[1];
				*ptr++ = pixels[2];
				*ptr++ = pixels[3];
			}
		} else {
			uint8_t count = cmd - 0xc0;
			for (uint8_t i = 0; i < count; i++) {
				uint8_t cmd = readUint8(data);
				uint16_t m = getLastFourBits(cmd);
				// debug(9, "Riven Pack Subcommand %02x", cmd);

				// Notes: p = value of the next uint8_t, m = last four bits of
				// the command

				// Arithmetic operations
				if (cmd >= 0x01 && cmd <= 0x0f) {
					// Repeat duplet at relative position of -m duplets
					B_PIXEL_MINUS(m * 2);
					B_PIXEL_MINUS(m * 2);
				} else if (cmd == 0x10) {
					// Repeat last duplet, but set the value of the second pixel
					// to p
					B_LASTDUPLET();
					B_BYTE();
				} else if (cmd >= 0x11 && cmd <= 0x1f) {
					// Repeat last duplet, but set the value of the second pixel
					// to the value of the -m pixel
					B_LASTDUPLET();
					B_PIXEL_MINUS(m);
				} else if (cmd >= 0x20 && cmd <= 0x2f) {
					// Repeat last duplet, but add x to second pixel
					B_LASTDUPLET();
					B_LASTDUPLET_PLUS_M();
				} else if (cmd >= 0x30 && cmd <= 0x3f) {
					// Repeat last duplet, but subtract x from second pixel
					B_LASTDUPLET();
					B_LASTDUPLET_MINUS_M();
				} else if (cmd == 0x40) {
					// Repeat last duplet, but set the value of the first pixel
					// to p
					B_BYTE();
					B_LASTDUPLET();
				} else if (cmd >= 0x41 && cmd <= 0x4f) {
					// Output pixel at relative position -m, then second pixel
					// of last duplet
					B_PIXEL_MINUS(m);
					B_LASTDUPLET();
				} else if (cmd == 0x50) {
					// Output two absolute pixel values, p1 and p2
					B_BYTE();
					B_BYTE();
				} else if (cmd >= 0x51 && cmd <= 0x57) {
					// Output pixel at relative position -m, then absolute pixel
					// value p
					// m is the last 3 bits of cmd here, not last 4
					B_PIXEL_MINUS(getLastThreeBits(cmd));
					B_BYTE();
				} else if (cmd >= 0x59 && cmd <= 0x5f) {
					// Output absolute pixel value p, then pixel at relative
					// position -m
					// m is the last 3 bits of cmd here, not last 4
					B_BYTE();
					B_PIXEL_MINUS(getLastThreeBits(cmd));
				} else if (cmd >= 0x60 && cmd <= 0x6f) {
					// Output absolute pixel value p, then (second pixel of last
					// duplet) + x
					B_BYTE();
					B_LASTDUPLET_PLUS_M();
				} else if (cmd >= 0x70 && cmd <= 0x7f) {
					// Output absolute pixel value p, then (second pixel of last
					// duplet) - x
					B_BYTE();
					B_LASTDUPLET_MINUS_M();
				} else if (cmd >= 0x80 && cmd <= 0x8f) {
					// Repeat last duplet adding x to the first pixel
					B_LASTDUPLET_PLUS_M();
					B_LASTDUPLET();
				} else if (cmd >= 0x90 && cmd <= 0x9f) {
					// Output (first pixel of last duplet) + x, then absolute
					// pixel value p
					B_LASTDUPLET_PLUS_M();
					B_BYTE();
				} else if (cmd == 0xa0) {
					// Repeat last duplet, adding first 4 bits of the next
					// uint8_t
					// to first pixel and last 4 bits to second
					uint8_t pattern = readUint8(data);
					B_LASTDUPLET_PLUS(pattern >> 4);
					B_LASTDUPLET_PLUS(getLastFourBits(pattern));
				} else if (cmd == 0xb0) {
					// Repeat last duplet, adding first 4 bits of the next
					// uint8_t
					// to first pixel and subtracting last 4 bits from second
					uint8_t pattern = readUint8(data);
					B_LASTDUPLET_PLUS(pattern >> 4);
					B_LASTDUPLET_MINUS(getLastFourBits(pattern));
				} else if (cmd >= 0xc0 && cmd <= 0xcf) {
					// Repeat last duplet subtracting x from first pixel
					B_LASTDUPLET_MINUS_M();
					B_LASTDUPLET();
				} else if (cmd >= 0xd0 && cmd <= 0xdf) {
					// Output (first pixel of last duplet) - x, then absolute
					// pixel value p
					B_LASTDUPLET_MINUS_M();
					B_BYTE();
				} else if (cmd == 0xe0) {
					// Repeat last duplet, subtracting first 4 bits of the next
					// uint8_t
					// to first pixel and adding last 4 bits to second
					uint8_t pattern = readUint8(data);
					B_LASTDUPLET_MINUS(pattern >> 4);
					B_LASTDUPLET_PLUS(getLastFourBits(pattern));
				} else if (cmd == 0xf0 || cmd == 0xff) {
					// Repeat last duplet, subtracting first 4 bits from the
					// next uint8_t
					// to first pixel and last 4 bits from second
					uint8_t pattern = readUint8(data);
					B_LASTDUPLET_MINUS(pattern >> 4);
					B_LASTDUPLET_MINUS(getLastFourBits(pattern));

					// Repeat operations
					// Repeat n duplets from relative position -m (given in
					// pixels, not duplets).
					// If r is 0, another uint8_t follows and the last pixel is
					// set
					// to that value
				} else if (cmd >= 0xa4 && cmd <= 0xa7) {
					B_NDUPLETS(3);
					B_BYTE();
				} else if (cmd >= 0xa8 && cmd <= 0xab) {
					B_NDUPLETS(4);
				} else if (cmd >= 0xac && cmd <= 0xaf) {
					B_NDUPLETS(5);
					B_BYTE();
				} else if (cmd >= 0xb4 && cmd <= 0xb7) {
					B_NDUPLETS(6);
				} else if (cmd >= 0xb8 && cmd <= 0xbb) {
					B_NDUPLETS(7);
					B_BYTE();
				} else if (cmd >= 0xbc && cmd <= 0xbf) {
					B_NDUPLETS(8);
				} else if (cmd >= 0xe4 && cmd <= 0xe7) {
					B_NDUPLETS(9);
					B_BYTE();
				} else if (cmd >= 0xe8 && cmd <= 0xeb) {
					B_NDUPLETS(10); // 5 duplets
				} else if (cmd >= 0xec && cmd <= 0xef) {
					B_NDUPLETS(11);
					B_BYTE();
				} else if (cmd >= 0xf4 && cmd <= 0xf7) {
					B_NDUPLETS(12);
				} else if (cmd >= 0xf8 && cmd <= 0xfb) {
					B_NDUPLETS(13);
					B_BYTE();
				} else if (cmd == 0xfc) {
					uint8_t b1 = readUint8(data);
					uint8_t b2 = readUint8(data);
					uint16_t m1 = ((getLastTwoBits(b1) << 8) + b2);

					for (uint16_t j = 0; j < ((b1 >> 3) + 1);
					     j++) { // one less iteration
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
				} // else warning("Unknown Riven Pack Subcommand 0x%02x", cmd);
			}
		}
	}

	return out;
}

EMSCRIPTEN_KEEPALIVE
void *tBMP(void *ptr, uint32_t size) {
	void *start = ptr;

	// Due to macro expansion, masks must go in front
	uint16_t width = 0x3ff & readUint16BE(ptr);
	uint16_t height = 0x3ff & readUint16BE(ptr);
	uint16_t bytesPerRow = 0x3fe & readUint16BE(ptr);
	uint16_t format = readUint16BE(ptr);

	struct colour *palette = NULL;
	if (format & FM_PALETTE) {
		ptr += 4; // Skip 4 byte header.
		palette = malloc(256 * sizeof(struct colour));

		for (uint16_t i = 0; i <= 0xff; i++) {
			palette[i].blue = readUint8(ptr);
			palette[i].green = readUint8(ptr);
			palette[i].red = readUint8(ptr);
		}
	}

	uint8_t *data;

	if ((format & FM_1COMP) == COMP_RIVEN)
		data = decompRiven(ptr, size - (ptr - start), bytesPerRow * height);

	// Simple output for now.
	void *out = malloc(4 + width * height * 4);
	((uint16_t *)out)[0] = width;
	((uint16_t *)out)[1] = height;
	uint8_t *outptr = out + 4;
	if (palette) {
		for (uint32_t i = 0; i < bytesPerRow * height; i++) {
			struct colour c = palette[data[i]];
			if (i % bytesPerRow < width) {
				outptr[0] = c.red;
				outptr[1] = c.green;
				outptr[2] = c.blue;
				outptr[3] = 0xff;
				outptr += 4;
			}
		}
		free(palette);
	}
	free(start);
	free(data);
	return out;
}
