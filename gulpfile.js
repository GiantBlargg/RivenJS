const gulp = require("gulp"),
	{ exec } = require("child_process"),
	glob = require("glob"),
	webpack = require("webpack"),
	webpackDevServer = require("webpack-dev-server"),
	webpackCfg = require("./webpack.config.js");

const wasmGlob = "src/**/*.c";
gulp.task("wasm", cb => {
	glob(wasmGlob, (er, files) => {
		if (er) return cb(er);
		exec("emcc " + files.join(" ") + " -o dist/wasm.js -s WASM=1", err => {
			if (err) return cb(err);
			return cb();
		});
	});
});
gulp.task("watch-wasm", ["wasm"], () => {
	gulp.watch(wasmGlob, ["wasm"]);
});

gulp.task("webpack", (cb) => {
	webpack(webpackCfg, (err, stats) => {
		if (err) return cb(err);
		console.log(stats.toString({ colors: true }));
		cb();
	})
});
gulp.task("webpack-dev-server", () => {
	if (typeof webpackCfg.entry == "string") {
		webpackCfg.entry = [webpackCfg.entry]
	}
	if (webpackCfg.entry instanceof Array) {
		webpackCfg.entry.push("webpack-dev-server/client?/");
	}
	new webpackDevServer(webpack(webpackCfg), webpackCfg.devServer).listen(webpackCfg.devServer.port, webpackCfg.devServer.host);
});

gulp.task("default", ["webpack", "wasm"]);

gulp.task("serve", ["webpack-dev-server", "watch-wasm"]);
