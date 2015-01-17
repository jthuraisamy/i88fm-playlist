// include gulp
var gulp = require('gulp');

// include plug-ins
var fs = require('fs');
var msx = require('gulp-msx');
var to5 = require('gulp-6to5');
var sass = require('gulp-sass');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var changed = require('gulp-changed');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var sourcemaps = require('gulp-sourcemaps');

// Default task.
gulp.task('default', [
    'html',
    'styles-vendor',
    'styles-project',
    'images',
    'scripts-vendor',
    'scripts-project'
], function() {});

gulp.task('watch', ['default'], function() {
    // Process HTML.
    gulp.watch('./public/src/*.html', ['html']);

    // Process styles.
    gulp.watch('./public/src/styles/vendor/*.css', ['styles-vendor']);
    gulp.watch('./public/src/styles/*.scss', ['styles-project']);

    // Process images.
    gulp.watch('./public/src/images/**/*', ['images']);

    // Process scripts.
    gulp.watch('./public/src/scripts/vendor/*.js', ['scripts-vendor']);
    gulp.watch('./public/src/scripts/*.jsx', ['scripts-project']);
});

// Process HTML pages.
gulp.task('html', function() {
    var htmlSrc = './public/src/*.html',
        htmlDst = './public/build';

    gulp.src(htmlSrc)
        .pipe(changed(htmlDst))
        .pipe(minifyHTML())
        .pipe(gulp.dest(htmlDst));
});

// Process vendor styles.
gulp.task('styles-vendor', function() {
    var cssSrc = './public/src/styles/vendor/*.css',
        cssDst = './public/build/styles';

    gulp.src(cssSrc)
        .pipe(minifyCSS())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(cssDst));
});

// Process project styles.
gulp.task('styles-project', function() {
    var scssSrc = './public/src/styles/*.scss',
        scssDst = './public/build/styles';

    gulp.src(scssSrc)
        .pipe(sass())
        .pipe(minifyCSS())
        .pipe(gulp.dest(scssDst));
});

// Process images.
gulp.task('images', function() {
    var imgSrc = './public/src/images/**/*',
        imgDst = './public/build/images';

    gulp.src(imgSrc)
        .pipe(changed(imgDst))
        .pipe(gulp.dest(imgDst))
});

// Transform JSX files.
gulp.task('transform-jsx', function() {
    var jsxSrc = './public/src/scripts/*.jsx',
        jsxDst = './public/src/scripts/compiled-jsx';

    gulp.src(jsxSrc)
        .pipe(msx())
        .pipe(gulp.dest(jsxDst))
});

// Perform jshint.
gulp.task('jshint', function() {
    var jsSrc = './public/src/scripts/compiled-jsx/*.js',
        jshintConfig = {
            asi: true,
            esnext: true
        };

    gulp.src(jsSrc)
        .pipe(jshint(jshintConfig))
        .pipe(jshint.reporter('default'));
});

// Process vendor scripts.
gulp.task('scripts-vendor', function() {
    var modules = [
        'mithril/mithril.js',
        'jquery/dist/jquery.js',
        'unveil/jquery.unveil.js',
        'foundation/js/foundation.js'
    ];
    var jsSrcDir = './bower_components/';
    var jsDst = './public/build/scripts';
    var jsSrc = modules.map(function(module) { return jsSrcDir + module; });

    gulp.src(jsSrc)
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(jsDst));
});

// Process projects scripts.
gulp.task('scripts-project', ['transform-jsx', 'jshint'], function() {
    var modules = ['model', 'view', 'controller', 'main'];
    var jsSrcDir = './public/src/scripts/compiled-jsx/';
    var jsDst = './public/build/scripts';
    var jsSrc = modules.map(function(module) { return jsSrcDir + module + '.js'; });

    gulp.src(jsSrc)
        .pipe(sourcemaps.init())
        .pipe(to5())
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(jsDst))
});