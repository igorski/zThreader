const path = require("path");

const config = {
    entry: "./zthreader.ts",
    resolve: { extensions: ['.ts'] },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                },
            }
        ]
    }
};

const browserConfig = {
    ...config,
    output: {
        filename: "zthreader.min.js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "self",
    }
};

const amdConfig = {
    ...config,
    output: {
        filename: "zthreader.amd.js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "amd",
        umdNamedDefine: true
    }
};

const moduleConfig = {
    ...config,
    output: {
        filename: "zthreader.js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "umd"
    }
};

module.exports = [
    browserConfig, amdConfig, moduleConfig
];
