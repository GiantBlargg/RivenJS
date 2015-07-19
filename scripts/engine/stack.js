define(["engine/data/MHWK", "engine/data/CARD", "engine/data/tBMP", "engine/data/ini", "engine/data/Binary"], function(MHWK, CARD, tBMP, ini) {
	var stack = {};

	var gimme;

	var fileNames = {};

	var typeProcess = {
		CARD : CARD,
		tBMP : tBMP
	};

	var cardFiles = ["BLST", "CARD", "FLST", "HSPT", "MLST", "PLST"];

	function process(name, callback) {

		stack[name] = {
			cards : [],
			resources : {}
		};

		function processType(type, data) {
			if (cardFiles.indexOf(type) == -1) {
				stack[name].resources[type] = [];
			}
			for (i in data) {
				if (typeProcess[type]) {
					var d = data[i].file;
					scheduleProc(d, typeProcess[type], data[i]);
					data[i].file = false;
				}
				if (cardFiles.indexOf(type) == -1) {
					stack[name].resources[type][i] = data[i];
				} else {
					if (!stack[name].cards[i]) {
						stack[name].cards[i] = {};
					}
					stack[name].cards[i][type] = data[i];
				}
			}
		}

		function done() {
			for (f in fileNames[name]) {
				if (!fileNames[name][f]) {
					return;
				}
			}

			if (proc.length) {
				return;
			};

			console.log(name, "loaded");
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

			if (proc.length == 0) {
				clearInterval(procTimeout);
				procTimeout = false;
				done();
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
		console.log(name, "loading")
		for (f in fileNames[name]) {
			gimme(f, process(name, callback));
		}
	};

	return stack;
});
