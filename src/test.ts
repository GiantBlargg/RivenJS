import Data from "./engine/assets"
import want from "./UI/want";

document.body.onload = start;

async function start() {
	await Data.factory(await want("riven.cfg"), want);

}

