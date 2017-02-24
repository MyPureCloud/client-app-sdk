/* jshint node: true */

'use strict';

var pkg = require('./package.json');

var gulp = require('gulp');
var gutil = require('gutil');
var del = require('del');
var fs   = require('fs');
var babel = require('gulp-babel');
var gulpJsdoc2md = require('gulp-jsdoc-to-markdown');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');

// Browser Bundling Modules
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

// Development Server Utils
var browserSync = require('browser-sync');

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

var buildDoc = function(){
  return gulp.src('dist-browser/purecloud-client-app-sdk.js')
    .pipe(gulpJsdoc2md({
        template: fs.readFileSync('./doc/doc.hbs', 'utf8') ,
        partial: "./doc/partials//**/*.hbs"
    })) //uses dmd to create readme, can find templates here https://github.com/jsdoc2md/dmd/tree/master/partials
    .on('error', function (err) {
      gutil.log(gutil.colors.red('jsdoc2md failed'), err.message);
    })
    .pipe(rename(function (path) {
      path.extname = '.md';
      path.basename = 'doc';
    }))
    .pipe(replace(/```/g, '~~~'))  // play nicely with kramdown
    .pipe(gulp.dest('doc'));
};

var buildBrowser = function(destPath=BROWSER_OUTPUT_DIR) {
    return browserify({entries: './src/index.js', standalone: API_EXPORT_NAME, debug: true})
        .transform('babelify', {presets: ['es2015']})
        .bundle()
        .pipe(source(pkg.name + '.js'))
        .pipe(gulp.dest(destPath))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest(destPath));
};

var buildExamples = function (destPath=BROWSER_OUTPUT_DIR, sdkUrl=null) {
    gulp.src('examples/**')
        .pipe(replace(/(\s*<script.*src=")([^"]+client-app-sdk[^"]+)(".*<\/script>\s*)/i, '$1' + (sdkUrl || '$2') + '$3\n'))
        .pipe(gulp.dest(destPath));
};

// Tasks
gulp.task('default', ['clean', 'build', 'build-browser','doc']);

gulp.task('clean', function() {
    return del([DEST_DIR, BROWSER_OUTPUT_DIR]);
});

gulp.task('build', ['clean'], build);

gulp.task('build-browser', ['clean'], () => {
    return buildBrowser();
});

gulp.task('doc', ['build-browser'], buildDoc);

gulp.task('watch', function() {
    var watcher = gulp.watch('src/**/*.js', function() {
        build();
        buildBrowser();
    });
});

gulp.task('serve', ['clean'], function() {
    let buildSdkForServer = buildBrowser.bind(this, 'dist/vendor');
    let buildExamplesForServer = buildExamples.bind(this, 'dist', 'vendor/purecloud-client-app-sdk.js');

    buildSdkForServer();
    buildExamplesForServer();

    browserSync({
        server: {
            baseDir: 'dist',
            directory: true
        },
        port: 8443,
        https: {
            key: 'sslcert-dev/key.pem',
            cert: 'sslcert-dev/cert.pem'
        }
    });

    gulp.watch('src/**/*.js', buildSdkForServer);
    gulp.watch('examples/**', buildExamplesForServer);
});
