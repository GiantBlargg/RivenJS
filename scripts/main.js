require(["jquery", "engine", "engine/data/Binary", "dev/globalizer", "dev/dieassert"], function($, engine) {

	$.noConflict('true');

	var mainCanvas = $("#mainCanvas")[0];
	var ctx = mainCanvas.getContext("2d");

	var files = $("#files")[0];

	var inited = false;

	$("#full").click(function() {
		mainCanvas.mozRequestFullScreen();
	});
	$("#GO").click(function() {
		//$("#upload").hide();
		if (inited) {
			engine.goStack($("#stack")[0].value, $("#card")[0].value);
		} else {
			gimme("riven.cfg", true, function(name, data) {
				engine.init(data, gimme, ctx);
				engine.goStack($("#stack")[0].value, $("#card")[0].value);
			});
			inited = true;
		}
	});
	mainCanvas.onmousedown = function(e) {
		var rect = e.target.getBoundingClientRect();
		engine.mouseDown(e.clientX - rect.left, e.clientY - rect.top);
	};
	function gimme(name, text, callback) {

		console.log(name);

		if ( typeof name == "string") {
			if (!callback) {
				callback = text;
				text = false;
			}

			var reader = new FileReader();
			if (text) {
				reader.readAsText(findFile(name));

				reader.onloadend = function() {
					callback(name, reader.result);
				};
			} else {
				reader.readAsArrayBuffer(findFile(name));

				reader.onloadend = function() {
					callback(name, new DataView(reader.result));
				};
			}
		} else if (Object.prototype.toString.call(name) === '[object Array]') {
			for (i in name) {
				gimme(name[i], text, callback);
			}
		} else {
			throw new Error("Only Strings or Arrays of Strings allowed");
		}
	}

	function findFile(name) {
		for (f in files.files) {
			if (files.files[f].name.toUpperCase() == name.toUpperCase()) {
				return files.files[f];
			}
		}
	}

});
