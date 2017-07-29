import Assets from "./engine/assets"
import want from "./UI/want";

document.body.onload = start;

async function start() {
	await Assets.factory(await want("riven.cfg"), want);

}

