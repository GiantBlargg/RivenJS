import * as $ from 'jquery';
import engine from "./engine"
import "./engine/data/Binary";
import "./dev/dieassert";

$.noConflict(true);
(<any>console.assert).useDebugger = true;

var mainCanvas = $("#mainCanvas")[0];
var ctx = (<HTMLCanvasElement>mainCanvas).getContext("2d");

var files = <HTMLInputElement>$("#files")[0];

var inited = false;

$("#full").click(function () {
	mainCanvas.requestFullscreen();
});
$("#GO").click(function () {
	//$("#upload").hide();
	if (inited) {
		engine.goStack((<HTMLInputElement>$("#stack")[0]).value, (<HTMLInputElement>$("#card")[0]).value);
	} else {
		gimme("riven.cfg", true, function (name, data) {
			engine.init(data, gimme, ctx);
			engine.goStack((<HTMLInputElement>$("#stack")[0]).value, (<HTMLInputElement>$("#card")[0]).value);
			inited = true;
		});
	}
});
mainCanvas.onmousedown = function (e) {
	var rect = (<Element>e.target).getBoundingClientRect();
	engine.mouseDown(e.clientX - rect.left, e.clientY - rect.top);
};
mainCanvas.onmouseup = function (e) {
	var rect = (<Element>e.target).getBoundingClientRect();
	engine.mouseUp(e.clientX - rect.left, e.clientY - rect.top);
};
function gimme(name, text, callback) {

	console.log(name);

	if (typeof name == "string") {
		if (!callback) {
			callback = text;
			text = false;
		}

		var reader = new FileReader();
		if (text) {
			reader.readAsText(findFile(name));

			reader.onloadend = function () {
				callback(name, reader.result);
			};
		} else {
			reader.readAsArrayBuffer(findFile(name));

			reader.onloadend = function () {
				callback(name, new DataView(reader.result));
			};
		}
	} else if (Object.prototype.toString.call(name) === '[object Array]') {
		for (var i in name) {
			gimme(name[i], text, callback);
		}
	} else {
		throw new Error("Only Strings or Arrays of Strings allowed");
	}
}

function findFile(name) {
	for (var f in files.files) {
		if (files.files[f].name.toUpperCase() == name.toUpperCase()) {
			return files.files[f];
		}
	}
}

