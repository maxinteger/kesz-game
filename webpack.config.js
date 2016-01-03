module.exports = {
	debug: true,
	devtool: 'inline-source-map',
	entry: './src/index.js',
	output: {
		path: './build',
		filename: 'bundle.js',
		sourceMapFilename: 'bundle.js.map'
	},
	module: {
		loaders: [{
			test: /\.jsx?$/,
			exclude: /(node_modules|bower_components)/,
			loader: 'babel',
			query: {
				presets: ['es2015']
			}
		}, {
			test: /\.css$/,
			loader: 'style!css'
		}]
	}
};