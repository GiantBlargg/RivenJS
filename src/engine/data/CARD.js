define(["./scripts", "./Binary"], function (scripts) {
	return function (data) {
		return {
			name: data.getInt16(0),
			zip: data.getUint16(2),
			script: scripts(data.subs(4))
		};
	};
});
