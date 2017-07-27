var path = require("path");

module.exports = {
	context: path.resolve(__dirname, "src"),
	entry: "./main.js",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist")
	},
	resolve: { extensions: [".webpack.js", ".web.js", ".js"] },
	devtool: "source-map",
	devServer: {
		host: "0.0.0.0",
		contentBase: path.join(__dirname, "dist"),
		compress: true,
		disableHostCheck: true
	}
};
