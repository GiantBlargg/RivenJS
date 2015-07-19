define(["engine/data/Binary"], function() {
	return function(data) {
		var handlers = new Array(data.getShort());
		for (var i = 0; i < handlers.length; i++) {
			handlers[i] = {
				event : data.getShort(),
				cmds : getCmds(data.getShort())
			};

		}

		function getCmds(num) {
			var cmds = [];
			for (var c = 0; c < num; c++) {
				var cmd = data.getShort();
				cmds[c] = {
					cmd : cmd
				};
				if (cmd == 8) {
					console.assert(data.getShort() == 2);
					cmds[c].args = {
						variable : data.getShort()
					};
					var numCase = data.getShort();
					
					for (var b=0;b<numCase;b++){
						cmds[c].args[data.getShort()]=getCmds(data.getShort());
					}
				} else {
					cmds[c].args = getArgs(data.getShort());
				}
			}
			return cmds;
		}

		function getArgs(num) {
			var args = [];

			for (var a = 0; a < num; a++) {
				args[a] = data.getShort();
			}
			return args;
		}

		return handlers;
	};
});
