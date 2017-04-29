var gulp = require('gulp'),
	bower = require('gulp-bower'),
	sass = require('gulp-sass'),
	autoprefix = require('gulp-autoprefixer'),
	uglify = require('gulp-uglifyjs'),
	notify = require('gulp-notify'),
	browserSync = require('browser-sync').create(),
	imagemin = require('gulp-imagemin'),
	cache = require('gulp-cache');

var config = {
	bowerDir: './bower_components',
	srcDir: './src',
	distDir: './dist'
};

gulp.task('bower', function () {
	return bower()
		.pipe(gulp.dest(config.bowerDir))
});

gulp.task('fonts-ico', function() {
	return gulp.src(config.srcDir + '/fonts/icomoon/**/*')
	.pipe(gulp.dest(config.distDir + '/fonts/icomoon'));
})

gulp.task('fonts', ['fonts-ico'], function () {
	return gulp.src([
			config.bowerDir + '/bootstrap-sass/assets/fonts/**/*',			
		])
		.pipe(gulp.dest(config.distDir + '/fonts'));
});

gulp.task('css', ['css-src'], function () {
	return gulp.src('src/css/app.scss')
		.pipe(sass({
			outputStyle: 'compressed',
			includePaths: [config.bowerDir + '/bootstrap-sass/assets/stylesheets'],
		}))
		.on('error', notify.onError(function (error) {
			return 'Error: ' + error.message;
		}))
		.pipe(autoprefix('last 3 version'))
		.pipe(gulp.dest(config.distDir + '/css'))
		.pipe(browserSync.stream());
});

// src CSS output
gulp.task('css-src', function(){
	return gulp.src(config.srcDir + '/css/app.scss')
	.pipe(sass({
		outputStyle: 'expanded',
		includePaths: [config.bowerDir + '/bootstrap-sass/assets/stylesheets']
	}))
	.on('error', notify.onError(function (error) {
			return 'Error: ' + error.message;
		}))
	.pipe(autoprefix('last 2 version'))
	.pipe(gulp.dest(config.srcDir + '/css'));
});

gulp.task('js', function () {
	return gulp.src([
			config.bowerDir + '/jquery/dist/jquery.min.js',
			config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap.js',
			config.srcDir + '/js/*.js'
		])
		.pipe(uglify('app.js', {
			compress: false,
			outSourceMap: true,
		}))
		.pipe(gulp.dest(config.distDir + '/js'));
});

// Task that ensures the [js] task is complete before reloading browsers
gulp.task('js-watch', ['js'], browserSync.reload);

// Copy HTML files into the production directory
gulp.task('html', function () {
	gulp.src(config.srcDir + '/*.html')
		.pipe(gulp.dest(config.distDir));
});

gulp.task('img', function(){
	return gulp.src(config.srcDir + '/img/**/*.+(png|jpg|gif|svg)')
	// Caching images that ran through imagemin
	.pipe(cache(imagemin({
		interlaced: true
	})))
	.pipe(gulp.dest(config.distDir + '/img'));
});

/**
 * Browsersync: Static Server + watching scss/html/js files
 * http://www.browsersync.io/docs/gulp/
 */
gulp.task('serve', ['css'], function () {
	browserSync.init({
		server: config.distDir
	});
	gulp.watch(config.bowerDir + '/**/*.scss', ['css']);
	gulp.watch(config.srcDir + '/**/*.scss', ['css-src', 'css']);
	gulp.watch(config.srcDir + '/*.html', ['html']).on('change', browserSync.reload);
	gulp.watch(config.srcDir + '/**/*.js', ['js-watch']);
});

gulp.task('default', ['fonts', 'css-src', 'css', 'js', 'html', 'serve']);

