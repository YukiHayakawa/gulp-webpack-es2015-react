/***
 * taskrunner
 * js compile
 * es2015 react 
 * 「moduleDir」内の「.js」をディレクトリ構成を保持したまま「outputDir」へ書き出し
 *
 * リリースモード
 * gulp rjs
 * 全ファイルコンパイル
 * js圧縮
 * React productionモード
 *
 * デバッグモード
 * gulp dwjs
 * 変更ファイルコンパイル
 * watch
 * React developmentモード
 * sourcemapあり
 *
 * setting 
 * gulpfile.jsからのpath
*/
const moduleDir = 'src';
const outputDir = 'htdocs';
/*
*
***/


const gulp    = require('gulp');
const webpack = require('webpack');
const del     = require('del');
const path    = require('path');
const glob    = require('glob');
const changed = require('gulp-changed');
const browser = require('browser-sync');

function buildJS(mode, filePath, callback){

		// 大文字で始まるファイルはdistしない
		let entries = {}
		if(filePath === "all") {
				glob.sync('./' + moduleDir + '/**/*.js').map(function(file){
						if(!file.match(/\/[A-Z].*?js/)) {
								entries[file.replace('./' + moduleDir + '/','./')] = file;
								console.log('dist:\'' + file.replace('./' + moduleDir + '/','./') + '\'');
						}
				});
		}else {
				entries[filePath.replace('./' + moduleDir + '/','./')] = filePath;
				console.log('dist:\'' + filePath.replace('./' + moduleDir + '/','./') + '\'');
		}
		const settings = {
				entry: entries,
				output: {
						path: path.join(__dirname + '/' + outputDir),
						filename: '[name]' 
				},
				resolve: {
						root: [
								path.join(__dirname + '/' + moduleDir + '/js'),
						],
						extensions: ['', '.js'],
				},    
				plugins:[]
		};

		settings.module = {
				loaders: [{
						test: /\.js$/,
						loader: 'babel-loader',
				}]
		}


		if(mode == 'debug'){
				settings.devtool = 'inline-source-map';
		}else if(mode == 'release'){
				settings.plugins.push(
						new webpack.DefinePlugin({
								'process.env': { NODE_ENV: JSON.stringify('production') }
						}),
						new webpack.optimize.UglifyJsPlugin({
								compress: { warnings: false }
						})
				);
		}

		webpack(settings, function(err, stats){
				if(err){
						console.error('webpack fatal error', err);
						return;
				}
				const jsonStats = stats.toJson();
				if(jsonStats.errors.length > 0){
						console.error('bundle error');
						jsonStats.errors[0].split('\n').map(function(errLine){
								console.error(errLine);
						});
						return;
				}
				if(jsonStats.warnings.length > 0){
						console.log('bundle warning', jsonStats.warnings);
				}
				console.log('bundle complete');
				browser.reload();
				if(callback){
						callback();
				}
		})
}

gulp.task('default', ['dwjs'],function (){
		return browser.init({
				port: 8888,
				server: {
						baseDir: './' + outputDir
				},
				open: false
		});
});

gulp.task('rjs', function(){
		buildJS('release', 'all', function(){
				del('./' + outputDir + '/**/*.map');
		});
});

gulp.task('djs', function(e){
		buildJS('debug', 'all');
});

gulp.task('dwjs', function(){
		console.log('Watch Start...');
		const watcher = gulp.watch(['./' + moduleDir + '/**/*.js']);
		watcher.on('change', function(evt) {
				const filePath = evt.path.replace(__dirname,'.')
				buildJS('debug',filePath);
		});
});

