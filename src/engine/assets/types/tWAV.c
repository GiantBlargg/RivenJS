#include <emscripten.h>
#include <endian.h>
#include <stdint.h>

#define readUint8(ptr)                                                         \
	*(uint8_t *)ptr;                                                           \
	ptr += 1

#define readUint16BE(ptr)                                                      \
	be16toh(*(uint16_t *)ptr);                                                 \
	ptr += 2

#define readUint32BE(ptr)                                                      \
	be32toh(*(uint32_t *)ptr);                                                 \
	ptr += 4

#define E_RAW 0
#define E_ADPCM 1
#define E_MPEG 2

EMSCRIPTEN_KEEPALIVE
void *tWAV(void *ptr, uint32_t size) {
	void *start = ptr;
	ptr += 12;
	uint32_t name = readUint32BE(ptr);
	while (name != 0x44617461) {
		ptr += readUint32BE(ptr);
		name = readUint32BE(ptr);
	}
	size = readUint32BE(ptr);
	size -= 20;
	uint16_t sampleRate = readUint16BE(ptr);
	uint32_t sampleCount = readUint32BE(ptr);
	uint8_t bitsPerSample = readUint8(ptr);
	uint8_t channels = readUint8(ptr);
	uint16_t encoding = readUint32BE(ptr);
	uint16_t loopCount = readUint32BE(ptr);
	uint32_t loopStart = readUint32BE(ptr);
	uint32_t loopEnd = readUint32BE(ptr);

	switch (encoding) { case E_ADPCM: }
}
