import Assets from "./engine/assets"
import getFile from "./UI/get-file";
import $ from "./UI/doc-help";

document.body.onload = start;

async function start() {
	let cfgFile = getFile("riven.cfg");
	let iniFile = getFile("Riven.ini");
	let assets = await Assets.factory(await cfgFile, await iniFile, getFile);
	$("go").click(async function () {
		let type = $("type").value;
		let loc = {
			stack: $("stack").value,
			ID: parseInt($("id").value),
			type: type
		};
		assets.setDepsTreeRoot(loc);
		let data = await assets.get(loc);
		if (data instanceof ImageData) {
			let canvas = document.createElement("canvas");
			canvas.width = data.width;
			canvas.height = data.height;
			let ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
			ctx.putImageData(data, 0, 0);
			$("container").prependChild(canvas);
		} else {
			console.log(data);
		}
	});
}

