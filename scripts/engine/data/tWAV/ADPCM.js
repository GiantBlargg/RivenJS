define(["engine/data/Binary"], function() {
	return function(data, channels) {
		var ima_index_table = [-1, -1, -1, -1, 2, 4, 6, 8, -1, -1, -1, -1, 2, 4, 6, 8];
		var ima_step_table = [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45, 50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 130, 143, 157, 173, 190, 209, 230, 253, 279, 307, 337, 371, 408, 449, 494, 544, 598, 658, 724, 796, 876, 963, 1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024, 3327, 3660, 4026, 4428, 4871, 5358, 5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487, 12635, 13899, 15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767];

		var last = [];

		for (var i = 0; i < channels; i++) {
			last[i] = {
				predictor : 0,
				step_index : 0,
			};
		}

		function decodeNibble(nibble, channel) {
			var E = (2 * (nibble & 0x7) + 1) * ima_step_table[last[channel].step_index];
			var diff = (nibble & 0x8) ? -E : E;
			var samp = clamp(last[channel].predictor + diff, -32768, 32767);

			last[channel].predictor = samp;
			last[channel].step_index += ima_index_table[nibble];
			last[channel].step_index = clamp(last[channel].step_index, 0, 88);
		}

		function clamp(value, min, max) {
			if (value > max) {
				value = max;
			} else if (value < min) {
				value = min;
			}
			return value;
		}

	};
});
