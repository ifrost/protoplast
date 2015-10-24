var gulp = require('gulp'),
    concat = require('gulp-concat'),
    minify = require('gulp-minify');

gulp.task('concat-plugins', function() {
    return gulp.src('./plugins/*.js')
        .pipe(concat('plugins.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('concat-protoplast', function(){
    gulp.src(['./dist/plugins.js', './protoplast.js'])
        .pipe(concat('protoplast.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('minify', function(){
    gulp.src('./dist/protoplast.js')
        .pipe(minify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['concat-plugins', 'concat-protoplast', 'minify']);