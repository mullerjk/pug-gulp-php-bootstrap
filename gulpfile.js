var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
    jade = require('gulp-jade-php'),
    sass = require('gulp-sass'),
    args = require('yargs').argv,
    rename = require('gulp-rename'),
    runSequence = require('run-sequence'),
	gulpif= require('gulp-if'),
	notify= require('gulp-notify'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify-es').default,
	imagemin = require('gulp-imagemin'),
	pug = require('gulp-pug-3'),
	pugPHPFilter = require('pug-php-filter');

var isRelease = args.release || false;   

gulp.task('jade', function() 
{
    return gulp.src('assets/pug/**/*.jade')
        .pipe(jade())
        .pipe(gulp.dest('build/'));
});

  gulp.task('pug', function() {
    return gulp.src('assets/pug/**/*.pug')
	 .pipe( pug({
		 pretty: "\t",
		 filters: {
		  php: pugPHPFilter
	  }
  }) )
	 .pipe(rename(function (path) {
		path.extname = ".php"
	  }))
	  .pipe(gulp.dest('build/'));
	});
	

gulp.task('images', function()
{
	if (!isRelease) 
	{
		console.warn("WARNING: running whitout --release, skipping image minification");
	}
	
	return gulp.src('assets/images/**/*')
		.pipe((plumber(
		{
			errorHandler: notify.onError("Error: <%= error.message %>")
		})))
		.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
		.pipe(plumber.stop())
		.pipe(gulp.dest('build/images/'));
});


gulp.task('styles', function()
{
	gulp.src(['assets/sass/**/*.scss'])
		.pipe(plumber({
			errorHandler: function (error) 
			{
				console.log(error.message);
				this.emit('end');
		}}))
		.pipe(sass({
			outputStyle		: 'nested',
			includePaths	: [
				'./node_modules/compass-mixins/lib'
			]
		}))
		.pipe(plumber.stop())
		.pipe(autoprefixer({
			overrideBrowserslist : ['last 2 versions']
		}))
		.pipe(gulp.dest('build/css/'))
});

gulp.task('js', function () 
{
	return gulp.src('assets/js/**/*.js')
		.pipe(plumber(
		{
			errorHandler: function (error) 
			{
				console.log(error.message);
				this.emit('end');
		}}))
		.pipe(gulpif(isRelease, uglify()))
		.pipe(rename({suffix: '.min'}))
		.pipe(plumber.stop())
		.pipe(gulp.dest('build/js/'))
});

gulp.task('fonts', function () 
{
	return gulp.src('assets/fonts/**/*')
		.pipe(gulp.dest('build/fonts/'))
});


gulp.task('watch', function () 
{
    gulp.watch('assets/pug/**/*.jade', ['jade']);
    gulp.watch('assets/pug/**/*.pug', ['pug']);
    gulp.watch("assets/sass/**/*.scss", ['styles']);
    gulp.watch("assets/js/**/*.js", ['js']);
    gulp.watch("assets/fonts/**/*", ['fonts']);
    gulp.watch("assets/images/**/*", ['images']);
});

gulp.task('build', function(){
	runSequence(['jade', 'pug', 'js', 'styles', 'fonts', 'images']);
});