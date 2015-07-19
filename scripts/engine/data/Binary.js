define(function() {

	DataView.prototype.subs = function(byteOffset, byteLength) {

		var end = this.byteOffset + this.byteLength;

		byteOffset = byteOffset || 0;

		console.assert(byteOffset >= 0);
		byteOffset = byteOffset + this.byteOffset;

		if (byteLength) {
			console.assert(byteLength <= end - byteOffset);
		} else {
			byteLength = end - byteOffset;
		}

		return new DataView(this.buffer, byteOffset, byteLength);

	};

	DataView.prototype.getChars = function(byteOffset, length) {
		result = "";
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

	DataView.prototype.setPos = function(pos) {
		this.pos = pos;
	};

	DataView.prototype.pos = 0;

	DataView.prototype.getByte = function() {
		this.pos++;
		try {
			return this.getUint8(this.pos - 1);
		} catch (e) {
			return 0;
		}
	};

	return DataView;
});
