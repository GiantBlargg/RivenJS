import Binary from "./Binary";
export default function (data) {
	//TODO add proper errors
	//sanity checks
	console.assert(data.getChars(0, 4) == "MHWK");
	console.assert(data.getUint32(4) + 8 == data.byteLength);
	console.assert(data.getChars(8, 4) == "RSRC");
	console.assert(data.getUint16(12) == 256);
	console.assert(data.getUint32(16) == data.byteLength);

	//extract
	var resDirOff = data.getUint32(20);

	//file table
	var fileTabOff = data.getUint16(24) + resDirOff;
	var fileTabSize = data.getUint16(26);

	var numFiles = data.getUint32(fileTabOff);
	var files = [];

	for (var i = 0; i < numFiles; i++) {
		var offset = fileTabOff + 4 + i * 10;
		files[i + 1] = data.subs(data.getUint32(offset), data.getUint16(offset + 4) + data.getUint8(offset + 6) * 65536);
	}

	//resource dir
	var resNameOff = data.getUint16(resDirOff) + resDirOff;
	var numTypes = data.getUint16(resDirOff + 2);

	var types = {};
	for (var i = 0; i < numTypes; i++) {
		var offset = resDirOff + 4 + i * 8;

		var resOff = resDirOff + data.getUint16(offset + 4);

		var numRes = data.getUint16(resOff);
		var res = [];
		for (var o = 0; o < numRes; o++) {
			var off = resOff + 2 + o * 4;
			var index = data.getUint16(off + 2);
			res[data.getUint16(off)] = {
				id: data.getUint16(off),
				index: index,
				file: files[index]
			};
		}

		var nameOff = resDirOff + data.getUint16(offset + 6);

		var numNames = data.getUint16(nameOff);
		for (var o = 0; o < numNames; o++) {
			var off = nameOff + 2 + o * 4;
			var index = data.getUint16(off + 2);
			for (var r in res) {
				if (res[r].index == index) {
					res[r].name = data.getChars(data.getUint16(off) + resNameOff);
				}
			}
		}

		types[data.getChars(offset, 4)] = res;
	}
	return types;
}
