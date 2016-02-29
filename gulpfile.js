var gulp = require('gulp'),
    clean = require('gulp-clean'),
    browserify = require('gulp-browserify'),
    bump = require('gulp-bump'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglifyjs');

gulp.task('bump', function(){
    gulp.src('./*.json', {read: false})
        .pipe(bump({type:'minor'}))
        .pipe(gulp.dest('./'));
});

gulp.task('clean', function() {
    gulp.src('./dist/*', {read: false})
        .pipe(clean());
});

gulp.task('browserify', ['clean'], function() {
    // Single entry po int to browserify
    gulp.src('main.js')
        .pipe(browserify({
            insertGlobals : true,
            debug : false
        }))
        .pipe(rename('protoplast.js'))
        .pipe(gulp.dest('./dist'))
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

gulp.task('build', ['browserify'], function() {
    gulp.src('dist/*')
        .pipe(uglify('protoplast.min.js'))
        .pipe(gulp.dest('dist'));
});

