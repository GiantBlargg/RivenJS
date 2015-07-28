define(["engine/stack"], function(stack) {

	var curStack;
	var curCard;

	var b,
	    buffer;

	var ctx;
	var gameVars = {};
	window.gv = gameVars;

	var activeHot = {};

	function getVar(v) {
		gameVars[v] = gameVars[v] || 0;
		return gameVars[v];
	};

	function go(card) {
		goStack(curStack, card);
	}

	function goStack(newStack, card) {
		console.log("Going to", newStack, card);
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
			addPLST(stack.getRes(curStack,"PLST",curCard).file[1]);
			event(6, stack.getRes(curStack, "CARD", curCard).file.script);
			scheduleUpdate();
		});
	}

	var plsts = [];

	function scheduleUpdate() {
		for (p in plsts) {
			var plst = plsts[p];
			buffer.putImageData(stack.getRes(curStack, "tBMP", plst.id).file, plst.left, plst.top, 0, 0, plst.right - plst.left, plst.bottom - plst.top);
		}
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
	}, No, No, No, No,
	function(args) {//7 set variable value
		console.log(args);
		gameVars[stack.getRes(curStack,"NAME",4).file[args[0]]] = args[1];
	},
	function(args) {//8 conditional branch
		//console.log(args);
		var v = getVar(stack.getRes(curStack,"NAME",4).file[args.variable]);
		if (args[v]) {
			runScript(args[v]);
		} else if (args[65535]) {
			runScript(args[65535]);
		}
	}, No, No, No, No, No, No, No, No,
	function(args) {//17 call external command
		console.log(stack.getRes(curStack,"NAME",3).file[args[0]], args);
	}, No,
	function(args) {//19 reload card
		go(curCard);
	}, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No, No,
	function(args) {//39 activate PLST record
		addPLST(stack.getRes(curStack,"PLST",curCard).file[args[0]]);
	}, No, No, No,
	function(args) {//43 activate BLST record
		var BLST = stack.getRes(curStack,"BLST",curCard).file[args[0]];
		activeHot[BLST.hotspot_id] = BLST.enable;
	}, No, No, No];

	console.log(cmd);

	function runScript(cmds) {
		for (c in cmds) {
			cmd[cmds[c].cmd](cmds[c].args, cmds[c].cmd);
		}
	}

	function addPLST(plst) {
		plsts.push(plst);
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
			event(4, checkHotspot(x, y).script);
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
