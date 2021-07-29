const path = require("path")

module.exports = {
    entry: "./src/test/index.ts",
    module: {
        rules: [
            {
                test: /.ts$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    output: {
        filename: "webpack-bundle.js",
        path: path.resolve(__dirname, "public_html")
    }
}