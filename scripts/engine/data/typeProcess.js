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
		NAME : function(data) {
			var fieldcount = data.getShort();
			var names = [];
			var stringsOff = fieldcount * 4 + 2;
			for (var i = 0; i < fieldcount; i++) {
				names[i] = data.getChars(data.getShort() + stringsOff);
			}
			return names;
		},
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
		RMAP : function(data) {
			var numCards = data.getUint32(0);
			var res = [];
			for (var i = 1; i <= numCards; i++) {
				res[i] = data.getUint32(4 * i);
			}
			return res;
		},
		tBMP : tBMP
	};
});
