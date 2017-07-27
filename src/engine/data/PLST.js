define(["./Binary"], function () {
	return function (data) {
		var bitmaps = [];
		var numBitmaps = data.getShort();
		for (var i = 0; i < numBitmaps; i++) {
			bitmaps[data.getShort()] = {
				id: data.getShort(),
				left: data.getShort(),
				top: data.getShort(),
				right: data.getShort(),
				bottom: data.getShort()
			};
		}
		return bitmaps;
	};
});
