var gulp = require('gulp'),
    clean = require('gulp-clean'),
    browserify = require('gulp-browserify'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglifyjs');

gulp.task('clean', function() {
    gulp.src('./dist/*', {read: false})
        .pipe(clean());
});

gulp.task('build', ['clean'], function() {
    // Single entry po int to browserify
    gulp.src('main.js')
        .pipe(browserify({
            insertGlobals : true,
            debug : false
        }))
        .pipe(rename('protoplast.js'))
        .pipe(gulp.dest('./dist'))

        .pipe(uglify('protoplast.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('debug-test', function() {
    gulp.src('main.js')
        .pipe(browserify({
            insertGlobals : true,
            debug : false
        }))
        .pipe(rename('protoplast.js'))
        .pipe(gulp.dest('./test/compiled'));

    gulp.src('test/protoplastTest.js')
        .pipe(browserify({
            insertGlobals : true,
            debug : false
        }))
        .pipe(rename('protoplastTest-browser.js'))
        .pipe(gulp.dest('./test/compiled'));

});


