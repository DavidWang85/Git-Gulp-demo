var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
// var jade = require('gulp-jade');
// var sass = require('gulp-sass');
// var plumber = require('gulp-plumber');
// var postcss = require('gulp-postcss');   
var autoprefixer = require('autoprefixer'); 
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync').create();
var minimist = require('minimist');
var gulpSequence = require('gulp-sequence');

//minimist套件範例
var envOptions = {
    string: 'env',
    default: { env: 'develop'}
}
var options = minimist(process.argv.slice(2), envOptions);
console.log(options);

//clean套件範例
gulp.task('clean', function () {      
    return gulp.src(['./.temp', './public'], { read: false })    
        .pipe($.clean());      
});
//自己寫的範例
gulp.task('copyHTML', function () {
    return gulp.src('./source/**/*.html')
        .pipe(gulp.dest('./public/'))
})
//jade套件範例
gulp.task('jade', function () {
    gulp.src('./source/*.jade')
        .pipe($.plumber())
        .pipe($.data(function () {
            var trip = require("./source/data/data.json")
            var menu = require("./source/data/menu.json");
            var source = {
                'trip': trip,
                'menu': menu
            };
            return source;
        }))
        .pipe($.jade({
            pretty: true
        }))
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.stream());
});
//sass套件範例
gulp.task('sass', function () {
    return gulp.src('./source/scss/**/*.scss')
        .pipe($.plumber())
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.postcss([autoprefixer()]))
        .pipe($.if(options.env ==='production', $.minifyCss()))
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream())
});
//babel套件範例
gulp.task('babel', () => {
    return gulp.src('./source/js/**/*.js')
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['es2015']
        }))
        .pipe($.concat('all.js'))
        .pipe($.if(options.env === 'production', $.uglify({
            compress:{
                drop_console:true
            }
        })))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js'))
        .pipe(browserSync.stream())
});
//bower套件範例
gulp.task('bower', function () {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest('./.temp/venders'))
});
//vendor
gulp.task('vendorJs', ['bower'], function () {
    return gulp.src('./.temp/venders/**/**.js')
        .pipe($.concat('vendors.js'))
        .pipe($.if(options.env === 'production', $.uglify({
            compress: {
                drop_console: true
            }
        })))
        .pipe(gulp.dest('./public/js'))
})
// browser-sync套件範例
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
});
//image-min套件範例
gulp.task('image-min', () => 
    gulp.src('./source/images/*')
        .pipe($.if(options.env === 'production', $.imagemin()))
        .pipe(gulp.dest('./public/images'))
)
// sequence套件範例
gulp.task('sequence', gulpSequence('clean', 'jade', 'sass', 'babel', 'vendorJs'))
//sass套件範例-監控
gulp.task('watch', function () {
    gulp.watch('./source/scss/**/*.scss', ['sass']);
    gulp.watch('./source/js/**/*.js', ['babel']);
    gulp.watch('./source/*.jade', ['jade']);
});
// gulp-gh-pages套件範例
gulp.task('deploy', function () {
    return gulp.src('./public/**/*')
        .pipe($.ghPages());
});
//合併上述任務
gulp.task('default', ['jade', 'sass', 'babel', 'vendorJs', 'browser-sync', 'image-min', 'watch']);