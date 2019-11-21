const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('./webpack.config.js');
const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
}));

app.listen(8889, function () {
    console.log('[Visualizer] Listening on port 8889');
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});
