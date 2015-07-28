require(["engine/data/MHWK", "engine/data/tWAV", "jquery", "dev/globalizer", "dev/dieassert"], function(MHWK, tWAV, $) {

	$.noConflict('true');
	
	console.assert.useDebugger = true;

	$("#GO").click(function() {
		var reader = new FileReader();
		reader.readAsArrayBuffer($("#file")[0].files[0]);

		reader.onloadend = function() {
			console.log(tWAV(MHWK(new DataView(reader.result)).tWAV[$("#index")[0].value].file));
		};
	});
});
