var gulp = require('gulp'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs');

gulp.task('clean', function() {
    gulp.src('./dist/*', {read: false})
        .pipe(clean());
});

gulp.task('concat', ['clean'], function() {
    return gulp.src(['protoplast.js', 'extension/aop.js', 'extension/dispatcher.js', 'extension/di.js', 'extension/component.js'])
        .pipe(concat('protoplast.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['concat'], function() {
    gulp.src('dist/*')
        .pipe(uglify('protoplast.min.js'))
        .pipe(gulp.dest('dist'));
});

