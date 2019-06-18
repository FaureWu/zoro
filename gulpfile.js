const gulp = require('gulp')
const replace = require('gulp-replace-string')

gulp.task('replace:code', function() {
  return gulp
    .src(['./dist/zoro.weapp.js'])
    .pipe(
      replace(/runtime;/, function(pattern) {
        return pattern + 'var regeneratorRuntime = runtime;'
      }),
    )
    .pipe(gulp.dest('./dist/'))
})

gulp.task('copy:book', function() {
  return gulp.src('./book/_book/**/*').pipe(gulp.dest('./docs/'))
})
