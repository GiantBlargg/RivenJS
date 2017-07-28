export default function (data, width, height, bytesRow) {
	var result = [];
	for (var i = 0; i < bytesRow * height; i++) {
		result[i] = data.getUint8(i);
	}
	return result;
};
