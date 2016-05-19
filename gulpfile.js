var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
 
gulp.task('js', function () {
	return gulp.src('src/js/app.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(uglify().on('error', gutil.log))
        .pipe(gulp.dest('dist'));
});

gulp.task('es6', function () {
    return gulp.src('src/js/app.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('dist'));
})

gulp.task('compress', function() {
  return gulp.src('dist/*.js')
    .pipe(uglify().on('error', gutil.log))    
    .pipe(gulp.dest('dist'));
});
