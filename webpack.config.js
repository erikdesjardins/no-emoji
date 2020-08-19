const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const InertEntryPlugin = require('inert-entry-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const rollupCommonjsPlugin = require('rollup-plugin-commonjs');
const rollupReplacePlugin = require('rollup-plugin-re');

module.exports = {
	entry: 'extricate-loader!interpolate-loader!./src/manifest.json',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'manifest.json',
	},
	module: {
		rules: [{
			test: /\.entry\.js$/,
			use: [
				{ loader: 'file-loader', options: { name: '[name].js', esModule: false } },
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
				{ loader: 'file-loader', options: { name: '[name].[ext]', esModule: false } },
			],
		}],
	},
	optimization: {
		minimize: false,
	},
	plugins: [
		new InertEntryPlugin(),
		new CopyWebpackPlugin({
			patterns: [{
				from: 'src/locales/*.json',
				to: '_locales/[name]/messages.json'
			}]
		}),
		new ZipPlugin({ filename: 'no-emoji.zip' }),
	],
};
