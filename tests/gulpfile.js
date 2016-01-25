var gulp = require('gulp');
var debug = require('gulp-debug');
var colorseur = require('../');

gulp.task('default', function() {
  console.log('default');
  gulp.src('test.css')
    .pipe(debug())
    .pipe(colorseur({
      compress: false,
      matches: [
        "#FFF",
        "blue",
        "Helvetica"
      ]
    }))
    .pipe(gulp.dest('./output'));
});

console.log('hi');
