define(["engine/data/MHWK", "engine/data/typeProcess", "engine/data/ini", "engine/data/Binary"], function(MHWK, typeProcess, ini) {
	var stack = {};

	var stacks = {};

	var gimme;

	var fileNames = {};

	var cardFiles = ["BLST", "CARD", "FLST", "HSPT", "MLST", "PLST", "SLST"];

	function process(name, callback) {

		stacks[name] = {};

		function processType(type, data) {
			stacks[name][type] = stacks[name][type] || [];
			for (i in data) {
				if (stack.config.curLoad != 2)
					if (typeProcess[type]) {
						var d = data[i].file;
						scheduleProc(d, typeProcess[type], data[i]);
					}
				stacks[name][type][i] = data[i];
			}
		}

		function done() {
			for (f in fileNames[name]) {
				if (!fileNames[name][f]) {
					return;
				}
			}

			if (proc.length && stack.config.curLoad == 0) {
				return;
			};

			console.log(name, "loaded");
			//console.log(stacks[name]);
			if (callback)
				callback();
		}

		var proc = [];

		var procTimeout;

		function scheduleProc(data, func, loc) {
			proc.push({
				data : data,
				func : func,
				loc : loc
			});
			if (!procTimeout) {
				procTimeout = setInterval(doProc, 1);
			}
		}

		function doProc() {
			var d = proc.shift();
			d.loc.file = d.func(d.data);

			//console.log(d.loc);

			if (proc.length == 0) {
				clearInterval(procTimeout);
				procTimeout = false;
				if (stack.config.curLoad == 0) {
					done();
				}
			}
		}

		return function(n, data) {

			var res = MHWK(data);

			for (type in res) {
				processType(type, res[type]);
			}

			fileNames[name][n] = true;
			done();
		};
	}


	stack.getRes = function(stackName, type, index) {
		if (stacks[stackName])
			if (stacks[stackName][type])
				if (stacks[stackName][type][index]) {
					if (stacks[stackName][type][index].file instanceof DataView)
						if (typeProcess[type])
							stacks[stackName][type][index].file = typeProcess[type](stacks[stackName][type][index].file.subs(0));

					return stacks[stackName][type][index];
				}
		return false;
	};

	stack.init = function(iniFile, g) {

		gimme = g;

		var result = ini.decode(iniFile.split("Data file sets")[1]);
		for (s in result) {
			fileNames[s] = {};
			var i = 0;
			while (result[s]["File_" + i]) {
				fileNames[s][result[s]["File_" + i].split('/').pop()] = false;
				i++;
			}
		}
	};

	stack.load = function(name, callback) {
		if (stacks[name]) {
			setTimeout(callback, 1);
		} else {
			console.log(name, "loading");
			for (f in fileNames[name]) {
				gimme(f, process(name, callback));
			}
		}
	};

	stack.config = {
		curLoad : 2,
		nextLoad : 1
	};

	return stack;
});
