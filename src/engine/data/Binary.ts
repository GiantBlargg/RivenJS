
export default class Binary extends DataView {

	pos = 0;

	subs(byteOffset, byteLength) {

		var end = this.byteOffset + this.byteLength;

		byteOffset = byteOffset || 0;

		console.assert(byteOffset >= 0);
		byteOffset = byteOffset + this.byteOffset;

		if (byteLength) {
			console.assert(byteLength <= end - byteOffset);
		} else {
			byteLength = end - byteOffset;
		}

		return new Binary(this.buffer.slice(byteOffset, byteOffset + byteLength));
	}


	getChars(byteOffset, length?) {
		var result = "";
		if (length) {
			for (var i = 0; i < length; i++) {
				result += String.fromCharCode(this.getUint8(byteOffset + i));
			}
		} else {
			var i = 0;
			while (this.getUint8(byteOffset + i) != 0) {
				result += String.fromCharCode(this.getUint8(byteOffset + i));
				i++;
			}
		}
		return result;
	};

	setPos(pos) {
		this.pos = pos;
	};

	getByte() {
		this.pos++;
		return this.getUint8(this.pos - 1);
	};
	getShort() {
		this.pos += 2;
		return this.getUint16(this.pos - 2);
	};
	getSShort() {
		this.pos += 2;
		return this.getInt16(this.pos - 2);
	};
	getLong() {
		this.pos += 4;
		return this.getUint32(this.pos - 4);
	};
}
