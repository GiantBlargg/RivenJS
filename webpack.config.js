var path = require("path");

module.exports = {
	context: path.resolve(__dirname, "src"),
	entry: "./main.ts",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist")
	},
	resolve: { extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"] },
	devtool: "source-map",
	module: { rules: [{ test: /\.tsx?$/, use: "ts-loader" }] },
	devServer: {
		host: "0.0.0.0",
		contentBase: path.join(__dirname, "dist"),
		compress: true,
		disableHostCheck: true
	}
};
