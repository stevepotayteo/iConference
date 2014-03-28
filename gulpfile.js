// https://github.com/deini/toy-server/blob/master/gulpfile.js

var gulp = require('gulp')
  , plumber = require('gulp-plumber')
  , nodemon = require('gulp-nodemon')
  , wait = require('gulp-wait')
  , exec = require('child_process').exec
  , livereload = require('gulp-livereload');

var paths = {
  scripts: ['*.js'],
};

gulp.task('server', function() {
  nodemon({ script: 'app.js' });
});

gulp.task('scripts', function() {  
  return gulp.src(paths.scripts)
    .pipe(wait(1500))
    .pipe(livereload());
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('start-redis', function() {
  exec('nohup redis-server redis.conf >/dev/null 2>&1&', {}, function (error, stdout, stderr) {
    if (error) {
      console.log('-------ERROR-------');
      console.log(error);
    }
  });
});

gulp.task('stop-redis', function() {
  exec('redis-cli SHUTDOWN', {}, function (error, stdout, stderr) {
    if (error) {
      console.log('-------ERROR-------');
      console.log(error);
    }
  });
});

gulp.task('default', ['server', 'scripts', 'watch']);