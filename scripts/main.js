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
		$("#disp").append(bmp);
		$(bmp).css("image-rendering", "-moz-crisp-edges");
		$(bmp).css("width", $("#zoom")[0].value * $(bmp)[0].width);
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
				return f;
			}
		}
	};

});
