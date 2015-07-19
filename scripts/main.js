require(["jquery", "engine", "dev/globalizer", "dev/dieassert"], function($, engine) {

	globalize("engine");
	$.noConflict('true');

	var mainCanvas = $("#mainCanvas")[0];
	var ctx = mainCanvas.getContext("2d");
	
	$("#GO").click(function(){
		$("#upload").hide();
	});
});
