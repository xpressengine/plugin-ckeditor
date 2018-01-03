var gulp = require("gulp"),
  $ = require('gulp-load-plugins')();

gulp.task('default', ['skin-minify', 'copy-vendor']);

gulp.task('skin-minify', function() {
  return gulp.src(['assets/ckeditor/skins/xe-minimalist/src/*.css', '!**/_*.css'])
    .pipe($.cleanCss({compatibility: 'ie9', inline: ['local']}))
    .pipe(gulp.dest('assets/ckeditor/skins/xe-minimalist'));
});

gulp.task('copy-vendor', function() {
  return gulp.src([
      './node_modules/cropper/dist/cropper.min.js',
      './node_modules/cropper/dist/cropper.min.css'
    ])
    .pipe(gulp.dest('components/EditorTools/ImageResizeTool/assets/vendor/cropper'));
});
