var gulp = require('gulp'),
    clean = require('gulp-clean'),
    browserify = require('gulp-browserify'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglifyjs');

gulp.task('clean', function() {
    gulp.src('./dist/*', {read: false})
        .pipe(clean());
});

gulp.task('concat', ['clean'], function() {
    return gulp.src(['protoplast.js', 'ext/aop.js', 'ext/dispatcher.js', 'ext/di.js', 'ext/component.js'])
        .pipe(concat('protoplast.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('browserify', function() {
    // Single entry point to browserify
    gulp.src('main.js')
        .pipe(browserify({
            insertGlobals : true,
            debug : false
        }))
        .pipe(rename('protoplast.js'))
        .pipe(gulp.dest('./dist'))
});

gulp.task('build', ['browserify'], function() {
    gulp.src('dist/*')
        .pipe(uglify('protoplast.min.js'))
        .pipe(gulp.dest('dist'));
});

