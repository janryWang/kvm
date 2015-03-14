var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
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
});

gulp.task('concat-big',['clean-scripts'],function () {
	return gulp.src([
		'./src/intro.js',
		'./src/lang.js',
		'./src/do.js',
		'./src/class.js',
		'./src/emitter.js',
		'./src/module.js',
		'./src/kvm.js',
		'./src/outro.js'])
		.pipe(concat('kvm.js'))
		.pipe(jshint())
		.pipe(gulp.dest('dist'))
});

gulp.task('concat-small',['concat-big'],function () {
	return gulp.src([
		'./src/mini/intro.js',
		'./src/mini/lang.js',
		'./src/mini/class.js',
		'./src/mini/emitter.js',
		'./src/mini/module.js',
		'./src/mini/kvm.js',
		'./src/mini/outro.js'])
		.pipe(concat('kvm-mini.js'))
		.pipe(jshint())
		.pipe(gulp.dest('dist/mini'))
});

gulp.task('compress',['concat-small'], function () {
	return gulp.src('dist/**/*.js')
		.pipe(uglify())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(gulp.dest('dist'));

});

gulp.task('watch',function(){
	gulp.watch('./src/*.js', ['compress']);
});

gulp.task('default',['watch']);

gulp.task('build',['compress']);
