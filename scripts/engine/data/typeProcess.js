define(["engine/data/CARD", "engine/data/HSPT", "engine/data/PLST", "engine/data/tBMP"], function(CARD, HSPT, PLST, tBMP) {
	return {
		BLST : function(data) {
			var BLST = [];
			var numBLST = data.getShort();
			for (var i = 0; i < numBLST; i++) {
				BLST[data.getShort()] = {
					enable : data.getShort(),
					hotspot_id : data.getShort()
				};
			}
			return BLST;
		},
		CARD : CARD,
		HSPT : HSPT,
		PLST : function(data) {
			var bitmaps = [];
			var numBitmaps = data.getShort();
			for (var i = 0; i < numBitmaps; i++) {
				bitmaps[data.getShort()] = {
					id : data.getShort(),
					left : data.getShort(),
					top : data.getShort(),
					right : data.getShort(),
					bottom : data.getShort()
				};
			}
			return bitmaps;
		},
		tBMP : tBMP
	};
});
