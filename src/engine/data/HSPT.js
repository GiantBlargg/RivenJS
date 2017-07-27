import scripts from "./scripts";
import "./Binary";
export default function (data) {
	var hotspots = [];
	var numHot = data.getShort();
	for (var i = 0; i < numHot; i++) {
		var hotspot = {
			blst_id: data.getShort(),
			name: data.getSShort(),
			left: data.getSShort(),
			top: data.getSShort(),
			right: data.getSShort(),
			bottom: data.getSShort()
		};
		data.pos += 2;
		hotspot.cursor = data.getShort();
		hotspot.index = data.getShort();
		data.pos += 2;
		hotspot.zip = data.getShort();
		hotspot.script = scripts(data);
		hotspots[hotspot.index] = hotspot;
	}
	return hotspots;
};
