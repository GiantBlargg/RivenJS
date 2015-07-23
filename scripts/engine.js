define(["engine/stack", "engine/data/tBMP"], function(stack, tBMP) {

	var curStack;
	var curCard;

	var b,
	    buffer;

	var ctx;

	var gameVars = [];

	var activeHot = {};

	function getVar(v) {
		gameVars[v] = gameVars[v] || 0;
		return gameVars[v];
	};

	function go(card) {
		goStack(curStack, card);
	}

	function goStack(newStack, card) {
		stack.load(newStack, function() {
			console.assert(newStack && card);
			if (curStack && curCard)
				event(7, stack.getRes(curStack, "CARD", curCard).file.script);
			curStack = newStack;
			curCard = card;
			for (i in stack.getRes(curStack, "HSPT", curCard).file) {
				if (stack.getRes(curStack,"HSPT",curCard).file[i].zip) {
					activeHot[stack.getRes(curStack,"HSPT",curCard).file[i].blst_id] = false;
				} else {
					activeHot[stack.getRes(curStack,"HSPT",curCard).file[i].blst_id] = true;
				}
			}
			var bitmap = stack.getRes(curStack,"PLST",curCard).file[1];
			drawBMP(bitmap.id, bitmap.left, bitmap.top, bitmap.right, bitmap.bottom);
			event(6, stack.getRes(curStack, "CARD", curCard).file.script);
			scheduleUpdate();
		});
	}

	function scheduleUpdate() {
		ctx.drawImage(b, 0, 0);
	}

	function event(event, target) {
		for (i in target) {
			if (target[i].event == event)
				runScript(target[i].cmds);
		}
	}

	function No(args, cmd) {
		console.warn("Not Implemented", cmd, args);
		//throw new Error("Not Implemented", arguments);
	}

	var cmd = [undefined, No,
	function(args) {
		go(args[0]);
	}, No, No, No, No, No,
	function(args) {//8 conditional branch
		if (args[args.variable]) {
			runScript(args[args.variable]);
		} else if (args[65535]) {
			runScript(args[65535]);
		}
	}, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No,
	function(args) {//39 activate PLST record
		var bitmap = stack.getRes(curStack,"PLST",curCard).file[args[0]];
		drawBMP(bitmap.id, bitmap.left, bitmap.top, bitmap.right, bitmap.bottom);
	}, No, No, No, No, No, No, No];

	console.log(cmd);

	function runScript(cmds) {
		for (c in cmds) {
			cmd[cmds[c].cmd](cmds[c].args, cmds[c].cmd);
		}
	}

	function drawBMP(id, left, top, right, bottom) {
		buffer.putImageData(stack.getRes(curStack, "tBMP", id).file, left, top, 0, 0, right - left, bottom - top);
	}

	function checkHotspot(x, y) {
		var hotspot;
		for (h in stack.getRes(curStack, "HSPT", curCard).file) {
			var hot = stack.getRes(curStack, "HSPT", curCard).file[h];
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
		},
		mouseDown : function(x, y) {
			event(0, checkHotspot(x, y).script);
		},
		mouseUp : function(x, y) {
			event(2, checkHotspot(x, y).script);
		}
	};
	return engine;
});
