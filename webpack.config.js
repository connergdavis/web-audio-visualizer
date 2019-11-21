// see https://webpack.js.org/configuration/

const path = require('path');
const webpack = require('webpack');

// resolves the absolute path of this folder
const root = function (append) {
  return path.resolve(__dirname, append);
};

module.exports = {

    mode: 'development',
    entry: root('src/index.tsx'),
    output: {
        filename: 'bundle.js',
        path: root('public')
    },
    module: {
        rules: [ {
            exclude: /node_modules/,
            test: /\.tsx?$/,
            use: [ 'ts-loader' ]
        }, {
            exclude: /node_modules/,
            test: /\.s[ac]ss$/i,
            use: [ 'style-loader', 'css-loader', 'sass-loader' ]
        } ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.jsx', '.js', '.scss' ]
    },
    devServer: {
        contentBase: root('public'),
        filename: 'bundle.js',
        host: '0.0.0.0',
        hot: true,
        port: 8888
    },
    devtool: 'source-map'

};
