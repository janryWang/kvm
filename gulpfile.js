var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var header = require('gulp-header');
var serve = require('gulp-serve');
var pkg = require('./package.json');
var browserify = require('gulp-browserify');
var babelify = require('babelify');
var banner = [
	'/**',
	' ** <%= pkg.name %> - <%= pkg.description %>',
	' ** @author <%= pkg.author %>',
	' ** @version v<%= pkg.version %>',
	' **/',
	''
].join('\n');


gulp.task('clean',function(){
	return gulp.src('dist', {read: false})
		.pipe(clean());
});

/*gulp.task('concat',['clean-scripts'],function () {
	return gulp.src([
		'./src/intro.js',
		'./src/lang.js',
		'./src/do.js',
		'./src/class.js',
		'./src/emitter.js',
		'./src/core.js',
		'./src/kvm.js',
		'./src/outro.js',
		'./plugins/*.js'])
		.pipe(concat('kvm.js'))
		.pipe(jshint())
		.pipe(gulp.dest('dist'))
});

gulp.task('concat-mini',['concat'],function () {
	return gulp.src([
		'./src/intro.js',
		'./src/lang.js',
		'./src/do.js',
		'./src/class.js',
		'./src/emitter.js',
		'./src/core.js',
		'./src/kvm.js',
		'./src/outro.js'])
		.pipe(concat('kvm-mini.js'))
		.pipe(jshint())
		.pipe(gulp.dest('dist'))
});
*/

gulp.task('build-scripts',['clean'],function(){
	return gulp.src('src/kvm.js')
	.pipe(browserify({
			transform: [babelify.configure({
				optional: ["runtime"]
			})]
		}))
		.pipe(gulp.dest('dist'))
});

gulp.task('build-plugins',function(){
	return gulp.src('plugins/*.js')
		.pipe(concat('kvm-plugins.js'))
		.pipe(gulp.dest('dist'))
});

gulp.task('compress',['build-scripts','build-plugins'], function () {
	return gulp.src('dist/**/*.js')
		.pipe(uglify())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(gulp.dest('dist'));

});

gulp.task('serve',serve({
	root: ['dist', 'test'],
	port: 3000
}));

gulp.task('watch',function(){
	gulp.watch('./{src,plugins}/*.js', ['compress']);
});

gulp.task('default',['watch','serve']);

gulp.task('build',['compress']);
