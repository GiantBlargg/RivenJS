import Assets from "./engine/assets"
import want from "./UI/want";
import $ from "./UI/doc-help";

document.body.onload = start;

async function start() {
	let assets = await Assets.factory(await want("riven.cfg"), want);
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

