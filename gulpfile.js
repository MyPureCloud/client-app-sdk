/* jshint node: true */

'use strict';

var pkg = require('./package.json');

var gulp = require('gulp');
var del = require('del');
var babel = require('gulp-babel');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

// Browser Bundling Modules
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var DEST_DIR = 'dist';
var BROWSER_OUTPUT_DIR = 'dist-browser';
var API_EXPORT_NAME = 'purecloud.apps';

var build = function() {
    gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(DEST_DIR));
};

var buildBrowser = function() {
    return browserify({entries: './src/index.js', standalone: API_EXPORT_NAME, debug: true})
        .transform('babelify', {presets: ['es2015']})
        .bundle()
        .pipe(source(pkg.name + '-' + pkg.version + '.js'))
        .pipe(gulp.dest(BROWSER_OUTPUT_DIR))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest(BROWSER_OUTPUT_DIR));
};

// Tasks
gulp.task('default', ['clean', 'build', 'build-browser']);

gulp.task('clean', function() {
    return del([DEST_DIR, BROWSER_OUTPUT_DIR]);
});

gulp.task('build', ['clean'], build);

gulp.task('build-browser', ['clean'], buildBrowser);

gulp.task('watch', function() {
    var watcher = gulp.watch('src/**/*.js', function() {
        build();
        buildBrowser();
    });
});
