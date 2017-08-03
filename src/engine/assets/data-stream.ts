
export default class DataStream extends DataView {

	pos = 0;

	getString(byteOffset: number, length?: number) {

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
	readString(length?: number) {
		let string = this.getString(this.pos, length);
		this.pos += string.length;
		if (length == undefined) { this.pos++; }
		return string;
	}

	readInt8() {
		this.pos++;
		return this.getInt8(this.pos - 1);
	};
	readUint8() {
		this.pos++;
		return this.getUint8(this.pos - 1);
	};
	readInt16(littleEndian?: boolean) {
		this.pos += 2;
		return this.getInt16(this.pos - 2, littleEndian);
	};
	readUint16(littleEndian?: boolean) {
		this.pos += 2;
		return this.getUint16(this.pos - 2, littleEndian);
	};
	readInt32(littleEndian?: boolean) {
		this.pos += 4;
		return this.getInt32(this.pos - 4, littleEndian);
	};
	readUint32(littleEndian?: boolean) {
		this.pos += 4;
		return this.getUint32(this.pos - 4, littleEndian);
	};
	readFloat32(littleEndian?: boolean) {
		this.pos += 4;
		return this.getFloat32(this.pos - 4, littleEndian);
	};
	readFloat64(littleEndian?: boolean) {
		this.pos += 8;
		return this.getFloat64(this.pos - 8, littleEndian);
	};

	writeInt8(value: number) {
		this.pos++;
		return this.setInt8(this.pos - 1, value);
	};
	writeUint8(value: number) {
		this.pos++;
		return this.setUint8(this.pos - 1, value);
	};
	writeInt16(value: number, littleEndian?: boolean) {
		this.pos += 2;
		return this.setInt16(this.pos - 2, value, littleEndian);
	};
	writeUint16(value: number, littleEndian?: boolean) {
		this.pos += 2;
		return this.setUint16(this.pos - 2, value, littleEndian);
	};
	writeInt32(value: number, littleEndian?: boolean) {
		this.pos += 4;
		return this.setInt32(this.pos - 4, value, littleEndian);
	};
	writeUint32(value: number, littleEndian?: boolean) {
		this.pos += 4;
		return this.setUint32(this.pos - 4, value, littleEndian);
	};
	writeFloat32(value: number, littleEndian?: boolean) {
		this.pos += 4;
		return this.setFloat32(this.pos - 4, value, littleEndian);
	};
	writeFloat64(value: number, littleEndian?: boolean) {
		this.pos += 8;
		return this.setFloat64(this.pos - 8, value, littleEndian);
	};
}
