define(["engine/data/Binary"], function() {
	return function(data) {
		console.assert(data.getChars(0, 4) == "MHWK");
		var size = data.getUint32(4);
		console.assert(data.getChars(8, 4) == "WAVE");

		data.pos = 12;

		if (data.getChars(12, 4) == "ADPC") {
			data.pos += 4;
			var s = data.getLong();
			data.pos += s;
		}
		if (data.getChars(data.pos, 4) == "Cue#") {
			throw new Error("Not Implemented");
		}

		console.assert(data.getChars(data.pos, 4) == "Data");
		data.pos += 4;
		var sound = {
			dataSize : data.getLong(),
			sampleRate : data.getShort(),
			numSample : data.getLong(),
			bitsPerSample : data.getByte(),
			channels : data.getByte(),
			encoding : data.getShort(),
			loop : data.getShort(),
			loopStart : data.getLong(),
			loopEnd : data.getLong()
		};
		return sound;
	};
});
