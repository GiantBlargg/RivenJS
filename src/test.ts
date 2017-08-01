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
		let data = await assets.get({
			stack: $("stack").value,
			ID: parseInt($("id").value),
			type: type
		});
		switch (type) {
			default:
				console.log(data);
				break;
		}
	});
}

