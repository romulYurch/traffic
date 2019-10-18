'use strict';

const webpack = require('webpack');

module.exports = {
	mode: 'development',
	entry: './public/js/traffic',
	output: {
		path: __dirname + '/public/dist',
		filename: 'build.js'
	},

	plugins: [
		new webpack.ProvidePlugin({
			                          $: 'jquery',
			                          jQuery: 'jquery',
			                          'window.jQuery': 'jquery',
			                          'mousewheel': 'jquery-mousewheel'
		                          }),
	],

	devtool: 'source-map'
};