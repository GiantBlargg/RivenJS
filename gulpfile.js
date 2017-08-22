const gulp = require("gulp"),
	{ exec } = require("child_process"),
	glob = require("glob"),
	webpack = require("webpack-stream");

gulp.task("wasm", cb => {
	glob("src/**/*.c", (er, files) => {
		if (er) return cb(er);
		exec("emcc " + files.join(" ") + " -o dist/wasm.js -s WASM=1", err => {
			if (err) return cb(err);
			return cb();
		});
	});
});

gulp.task("pack", () => {
	return gulp.src("src/test.ts")
		.pipe(webpack(require('./webpack.config.js'), require("webpack")))
		.pipe(gulp.dest("dist/"));
});

gulp.task("default", ["pack", "wasm"]);

gulp.task("devServe", ["default"]);
