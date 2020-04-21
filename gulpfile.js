const { src, dest, task, series, watch, parallel } = require('gulp');
const rm = require('gulp-rm');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const px2rem = require('gulp-smile-px2rem');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const svgo = require('gulp-svgo');
const svgSprite = require('gulp-svg-sprite');
const {SRC_PATH, DIST_PATH, STYLES_LIBS, JS_LIBS} = require('./gulp.config');

sass.compiler = require('node-sass');

task( 'clean', () => {
    return src(`${DIST_PATH}/**/*`, { read: false }).pipe( rm() )
  })

task('copy:html', () => {
  return src(`${SRC_PATH}/*.html`)
    .pipe(dest(DIST_PATH))
    .pipe(reload({stream: true}));
})

task('styles', () => {
  return src(...STYLES_LIBS, 'main.scss')
  .pipe(sourcemaps.init())
    .pipe(concat('main.min.scss'))
    .pipe(sassGlob())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(px2rem())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    // .pipe(gcmq())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(dest('dist'))
    .pipe(reload({ stream: true }))
});

const libs = [
  'node_modules/jquery/dist/jquery.js',
  
]

task('scripts', () => {
  return src([...JS_LIBS, 'src/js/*.js'])
  .pipe(sourcemaps.init())
  .pipe(concat('main.min.js'))
  .pipe(babel({
    presets: ['@babel/env']
}))
  .pipe(uglify())
  .pipe(sourcemaps.write())
  .pipe(dest(DIST_PATH))
  .pipe(reload({ stream: true }))
})

task('icons', () => {
  return src('src/img/icons/*.svg')
    .pipe(svgo({
      plugins: [{
        removeAttrs: {
          attrs: '(fill|stroke|styles|width|height|data.*)'
        }
      }]
    }))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../sprite.svg'
        }
      }
    }))
    .pipe(dest('dist/img/icons'))
})

task('server', () => {
  browserSync.init({
      server: {
          baseDir: "./dist"
      },
      open: false
  });
});

watch('./src/styles/**/*.scss', series('styles'));
watch('./src/*.html', series('copy:html'));
watch('./src/js/*.js', series('scripts'));
watch('./img/icons/*.svg', series('icons'));

task('default', series('clean', parallel('copy:html', 'styles', 'scripts', 'icons'), 'server'));