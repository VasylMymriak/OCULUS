const { src, dest, series, watch, parallel } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2wow2 = require('gulp-ttf2woff2');
const svgSprite = require('gulp-svg-sprite');
const include = require('gulp-include');

function pages(){
  return src('app/pages/*.*')
  .pipe(include({
    includePaths: 'app/components'
  }))
  .pipe(dest('app'))
  .pipe(browserSync.stream())
}

function fonts() {
  return src('app/fonts/src/*.*')
    .pipe(fonter({
      formats: ['woff', 'ttf']
    }))
    .pipe(src('app/fonts/*.ttf'))
    .pipe(ttf2wow2())
    .pipe(dest('app/fonts'))
}

function image() {
  return src(['app/img/src/*.*', '!app/img/src/*.svg'])
    .pipe(newer('app/img'))
    .pipe(avif({ quality: 50 }))

    .pipe(src('app/img/src/*.*'))
    .pipe(newer('app/img'))
    .pipe(webp())

    .pipe(src('app/img/src/*.*'))
    .pipe(newer('app/img'))
    .pipe(imagemin())

    .pipe(dest('app/img'))

}

function sprite() {
  return src('app/img/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg',
          example: true
        }
      }
    }))
    .pipe(dest('app/img'))
}

function styles() {
  return src('app/scss/*.scss')
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
    .pipe(concat('style.min.css'))
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
};

function scripts() {
  return src([
    'node_modules/swiper/swiper-bundle.js',
    'app/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
};

function watching() {
  browserSync.init({
    server: {
      baseDir: "app/"
    }
  });
  watch(['app/scss/*.scss'], styles),
    watch(['app/img/src'], image),
    watch(['app/js/main.js'], scripts),
    watch(['app/components/*', 'app/pages/*'], pages),
    watch(['app/**/*.html']).on('change', browserSync.reload)
}


function cleanDist() {
  return src('dist', { allowEmpty: true })
    .pipe(clean())
}

function building() {
  return src([
    'app/css/style.min.css',
    'app/img/*.*',

    '!app/img/*.svg',
    '!app/img/**/*.html',

    'app/img/sprite.svg',
    'app/fonts/*.*',
    'app/js/main.min.js',
    'app/**/*.html'
  ], { base: 'app' })
    .pipe(dest('dist'));
}


exports.styles = styles;
exports.image = image;
exports.fonts = fonts;
exports.pages = pages;
exports.sprite = sprite;
exports.scripts = scripts;
exports.watching = watching;
exports.build = series(cleanDist, building);
exports.default = parallel(styles, scripts, watching); //,this.build 