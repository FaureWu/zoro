const gulp = require('gulp')
const replace = require('gulp-replace-string')

gulp.task('replace:code', function() {
  return gulp
    .src(['./dist/zoro.js'])
    .pipe(
      replace(/runtime;/, function(pattern: string) {
        return pattern + 'var regeneratorRuntime = runtime;'
      }),
    )
    .pipe(gulp.dest('./dist/'))
})
