var gulp = require('gulp');
var colorseur = require('../');

gulp.task('default', function() {
  console.log('default');
  gulp.src('test.css')
    .pipe(colorseur({
      colors: [
        "blue",
        "#FFF"
      ]
    }));
});

console.log('hi');
