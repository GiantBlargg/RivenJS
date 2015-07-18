require(["jquery", "data/MHWK", "data/tBMP", "data/Binary", "dev/globalizer", "dev/dieassert"], function($, MHWK, tBMP, Binary) {

	console.assert.useDebugger = true;

	$(".hide").hide();
	$("#submit").click(function() {
		console.log("Go");
		$(".hide").hide();
		var reader = new FileReader();
		reader.readAsArrayBuffer($("#file")[0].files[0]);
		$(reader).load(function() {
			window.file = MHWK(new Binary(reader.result));
			/*for (i in window.file["tBMP"]) {
			 showBMP(i);
			 }*/
			$(".hide").show();
		});
	});

	function showBMP(id) {
		var bmp = tBMP(window.file.tBMP[id].file);
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext("2d");
		canvas.width=bmp.width;
		canvas.height=bmp.height;
		ctx.putImageData(bmp, 0, 0);
		$("#disp").append(canvas);
		$(canvas).css("image-rendering", "-moz-crisp-edges");
		$(canvas).css("width", $("#zoom")[0].value * bmp.width);
	}


	$("#pic").click(function() {
		showBMP($("#number")[0].value);
	});
	$("#zoom").change(function() {
		$("canvas").each(function() {
			$(this).css("width", $("#zoom")[0].value * $(this)[0].width);
		});
	});
	window.findBMP = function(name) {
		for (f in file.tBMP) {
			if (file.tBMP[f].name == name) {
				showBMP(f);
				return f;
			}
		}
	};

});
