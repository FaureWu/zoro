const gulp = require('gulp')
const replace = require('gulp-replace-string')
const rename = require('gulp-rename')

gulp.task('replace:code', function() {
  return gulp
    .src(['./dist/zoro.weapp-gen.js'])
    .pipe(
      replace(/runtime;/, function(pattern: string) {
        return pattern + 'var regeneratorRuntime = runtime;'
      }),
    )
    .pipe(gulp.dest('./dist/'))
})

gulp.task('copy:type', function() {
  return gulp.src(['./src/zoro.d.ts'])
    .pipe(rename('zoro.weapp.d.ts'))
    .pipe(gulp.dest('./dist'))
})
