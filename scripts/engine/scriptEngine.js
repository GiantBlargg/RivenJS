define(["engine/stack"], function(stack) {

	function scriptEngine(engineItrfc) {
		engineItrfc.getVar = function getVar(v) {
			this.gameVars[v] = this.gameVars[v] || 0;
			return this.gameVars[v];
		};
		this.scriptBlock.prototype.commands.engineItrfc = engineItrfc;
		this.scriptBlock.prototype.commands.scriptEngine = this;
	}


	scriptEngine.prototype.event = function event(event, handlers, callback) {
		var handled = false;
		for (i in handlers) {
			if (handlers[i].event == event) {
				new this.scriptBlock(handlers[i].cmds, callback);
				handled = true;
			}
		}
		if (!handled) {
			callback();
		}
	};
	scriptEngine.prototype.scriptBlock = function scriptBlock(script, parentNext) {
		this.pos = 0;

		this.script = script;
		this.parentNext = parentNext;
		this.next();
	};
	scriptEngine.prototype.scriptBlock.prototype.next = function next() {
		this.pos++;
		if (this.pos > this.script.length) {
			if (this.parentNext) {
				this.parentNext();
			}
		} else {
			this.commands[this.script[this.pos - 1].cmd](this.script[this.pos - 1].args, this.next.bind(this), this.script[this.pos - 1].cmd);
		}
	};

	function No(args, next, cmd) {
		console.warn("Not Implemented", cmd, args);
		//throw new Error("Not Implemented", arguments);
		next();
	}


	scriptEngine.prototype.scriptBlock.prototype.commands = [undefined, No//1 draw tBMP resource
	,
	function(args, next) {//2 go to card
		this.engineItrfc.go(args[0]);
		next();
	}, No//3 activate inline SLST record
	, No//4 play local tWAV resource
	, undefined, undefined,
	function(args, next) {//7 set variable value
		console.log(args);
		this.engineItrfc.gameVars[stack.getRes(this.engineItrfc.curCard.stack,"NAME",4).file[args[0]]] = args[1];
		next();
	},
	function(args, next) {//8 conditional branch
		//console.log(args);
		var v = this.engineItrfc.getVar(stack.getRes(this.engineItrfc.curCard.stack,"NAME",4).file[args.variable]);
		if (args[v]) {
			new this.scriptEngine.scriptBlock(args[v], next);
		} else if (args[65535]) {
			new this.scriptEngine.scriptBlock(args[65535], next);
		} else {
			next();
		}
	}, No//9 enable hotspot
	, No//10 disable hotspot
	, undefined, No//12
	, No//13 set mouse cursor
	, No//14 pause script execution
	, undefined, undefined,
	function(args, next) {//17 call external command
		console.log(stack.getRes(this.engineItrfc.curCard.stack,"NAME",3).file[args[0]], args);
		next();
	}, No//18 transition
	,
	function(args, next) {//19 reload card
		this.engineItrfc.go(this.engineItrfc.curCard);
		next();
	}, No//20 disable screen update
	, No//21 enable screen update
	, undefined, undefined, No//24 enable screen update
	, undefined, undefined,
	function(args,next) {//27 go to stack
		this.engineItrfc.goCyan(stack.getRes(this.engineItrfc.curCard.stack,"NAME",5).file[args[0]],(args[1]<<16)+args[2],next);
	}, No//28
	, No//29
	, undefined, No//31
	, No//32 play foreground movie
	, No//33 play background movie
	, No//34
	, undefined, No//36
	, No//37
	, No//38
	,
	function(args, next) {//39 activate PLST record
		this.engineItrfc.plsts.push(stack.getRes(this.engineItrfc.curCard.stack,"PLST",this.engineItrfc.curCard.card).file[args[0]]);
		next();
	}, No//40 activate SLST record
	, No//41
	, undefined,
	function(args, next) {//43 activate BLST record
		var BLST = stack.getRes(this.engineItrfc.curCard.stack,"BLST",this.engineItrfc.curCard).file[args[0]];
		activeHot[BLST.hotspot_id] = BLST.enable;
		next();
	}, No//44 activate FLST record
	, No//45 do zip mode
	, No//46 activate MLST record
	];

	return scriptEngine;
});
