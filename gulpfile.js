var gulp = require("gulp"),
  $ = require('gulp-load-plugins')();

gulp.task('default', ['skin-minify']);

gulp.task('skin-minify', function() {
  return gulp.src(['assets/ckeditor/skins/xe-minimalist/src/*.css', '!**/_*.css'])
    .pipe($.cleanCss({compatibility: 'ie9'}))
    .pipe(gulp.dest('assets/ckeditor/skins/xe-minimalist'));
});
