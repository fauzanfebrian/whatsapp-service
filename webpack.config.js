const path = require('path')
const nodeExternal = require('webpack-node-externals')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
    entry: './src/index.ts',
    mode: 'production',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'), //set output dir to /build
        filename: 'index.js', //name of build app
    },
    resolve: {
        modules: [path.resolve(__dirname), 'node_modules'],
        extensions: ['.ts', '.js', '.json'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                loader: 'ts-loader',
            },
        ],
    },
    externals: [nodeExternal()],
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    // keep the function/class name (typeorm need this)
                    keep_fnames: true,
                },
            }),
        ],
    },
}
