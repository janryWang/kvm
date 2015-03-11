var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var header = require('gulp-header');
var pkg = require('./package.json');

var banner = [
	'/**',
	' ** <%= pkg.name %> - <%= pkg.description %>',
	' ** @author <%= pkg.author %>',
	' ** @version v<%= pkg.version %>',
	' **/',
	''
].join('\n');


gulp.task('clean-scripts',function(){
	return gulp.src('dist', {read: false})
		.pipe(clean());
}).task('concat',['clean-scripts'],function () {
	return gulp.src(['./src/intro.js',
		'./src/lang.js',
		'./src/do.js',
		'./src/class.js',
		'./src/emitter.js',
		'./src/module.js',
		'./src/kvm.js',
		'./src/outro.js'])
		.pipe(concat('kvm.js'))
		.pipe(gulp.dest('dist'))
}).task('compress',['concat'], function () {
	return gulp.src('dist/*.js')
		.pipe(uglify())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(gulp.dest('dist'));

}).task('default',['compress']);