define(["engine/stack", "engine/scriptEngine"], function(stack, scriptEngine) {

	var curCard = {
		stack : null,
		card : null
	};

	var b,
	    buffer;

	var ctx;

	var gameVars = {};

	var activeHot = {};

	var plsts = [];

	var scriptItrfc = {
		gameVars : gameVars,
		activeHot : activeHot,
		go : go,
		goStack : goStack,
		scheduleUpdate : scheduleUpdate,
		plsts : plsts,
		curCard : curCard,
		goCyan : goCyan,
	};

	var script = new scriptEngine(scriptItrfc);

	function go(card, callback) {
		goStack(curCard.stack, card, callback);
	}

	function goCyan(newStack, id, callback) {
		stack.load(newStack, function() {
			var RMAP = stack.getRes(newStack, "RMAP", 1).file;
			var card;
			for (i in RMAP) {
				if (RMAP[i]==id){
					card = i;
				}
			}
			if (card) {
				goStack(newStack, card, callback);
			} else {
				console.log("WRONG!");
			}
		});
	}

	function goStack(newStack, card, callback) {
		console.assert(newStack && card);
		console.log("Going to", newStack, card);
		stack.load(newStack, function() {
			if (curCard.stack && curCard.card) {
				script.event(7, stack.getRes(curCard.stack, "CARD", curCard.card).file.script, postEvent7);
			} else {
				postEvent7();
			}

		});

		function postEvent7() {
			curCard.stack = newStack;
			curCard.card = card;
			plsts.length = 0;
			for (i in stack.getRes(curCard.stack, "HSPT", curCard.card).file) {
				if (stack.getRes(curCard.stack,"HSPT",curCard.card).file[i].zip) {
					activeHot[stack.getRes(curCard.stack,"HSPT",curCard.card).file[i].blst_id] = false;
				} else {
					activeHot[stack.getRes(curCard.stack,"HSPT",curCard.card).file[i].blst_id] = true;
				}
			}
			plsts.push(stack.getRes(curCard.stack,"PLST",curCard.card).file[1]);
			script.event(6, stack.getRes(curCard.stack, "CARD", curCard.card).file.script, scheduleUpdate);
		}

	}

	function scheduleUpdate() {
		for (p in plsts) {
			var plst = plsts[p];
			buffer.putImageData(stack.getRes(curCard.stack, "tBMP", plst.id).file, plst.left, plst.top, 0, 0, plst.right - plst.left, plst.bottom - plst.top);
		}
		ctx.drawImage(b, 0, 0);
	}

	function checkHotspot(x, y) {
		var hotspot;
		for (h in stack.getRes(curCard.stack, "HSPT", curCard.card).file) {
			var hot = stack.getRes(curCard.stack, "HSPT", curCard.card).file[h];
			if (x > hot.left && x < hot.right && y > hot.top && y < hot.bottom && activeHot[hot.blst_id])
				hotspot = hot;
		}
		return hotspot;
	}

	var engine = {
		init : function(ini, gimme, c) {
			ctx = c;
			b = document.createElement('canvas');
			b.width = ctx.canvas.width;
			b.height = ctx.canvas.height;
			buffer = b.getContext("2d");
			stack.init(ini, gimme);
		},
		goStack : goStack,
		go : go,
		mouseMove : function(x, y) {
			script.event(4, checkHotspot(x, y).script);
		},
		mouseDown : function(x, y) {
			script.event(0, checkHotspot(x, y).script);
		},
		mouseUp : function(x, y) {
			script.event(2, checkHotspot(x, y).script);
		}
	};
	return engine;
});
