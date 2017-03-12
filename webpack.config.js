const path = require('path');

const InertEntryPlugin = require('inert-entry-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const rollupCommonjsPlugin = require('rollup-plugin-commonjs');
const rollupReplacePlugin = require('rollup-plugin-re');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
	entry: 'extricate-loader!interpolate-loader!./src/manifest.json',
	bail: isProduction,
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'manifest.json',
	},
	module: {
		rules: [{
			test: /\.entry\.js$/,
			use: [
				{ loader: 'file-loader', options: { name: '[name].js' } },
				{
					loader: 'webpack-rollup-loader',
					options: {
						plugins: [
							rollupCommonjsPlugin({ extensions: ['.js', '.png'] }),
							rollupReplacePlugin({
								patterns: [{ test: '__webpack_public_path__', replace: '""' }],
							}),
						],
					},
				},
			],
		}, {
			test: /\.(png)$/,
			use: [
				{ loader: 'file-loader', options: { name: '[name].[ext]' } },
			],
		}],
	},
	plugins: [
		new ProgressBarPlugin(),
		new InertEntryPlugin(),
		(isProduction && new ZipPlugin({ filename: 'no-emoji.zip' })),
	].filter(x => x),
};
