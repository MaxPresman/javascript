const gulp = require('gulp');
const babel = require('gulp-babel');
const runSequence = require('run-sequence');
const browserify = require('browserify');
const gutil = require('gulp-util');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const rename = require("gulp-rename");

gulp.task('compileBabel', () => {
    return gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(rename((path) => { path.basename = path.basename.replace(".babel", "") }))
        .pipe(gulp.dest('./lib'));
});

gulp.task('browserify', () => {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: './lib/pubnub-common.js',
        debug: true,
        // defining transforms here will avoid crashing your stream
        transform: []
    });

    return b.bundle()
        .pipe(source('pubnub.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', () => runSequence('compileBabel','browserify'))