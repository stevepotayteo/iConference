// https://github.com/deini/toy-server/blob/master/gulpfile.js

var gulp = require('gulp')
  , plumber = require('gulp-plumber')
  , nodemon = require('gulp-nodemon')
  , wait = require('gulp-wait')
  , open = require('gulp-open')
  , exec = require('child_process').exec
  , livereload = require('gulp-livereload')
  , fs = require('fs')
  , nconf = require('nconf')
  , path = require('path')
  ;

nconf.argv().env().file({ file: path.join(__dirname, 'config/config.json') });

var paths = {
  scripts: ['*.js'],
  templates: ['*.jade']
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
  if(fs.open(__dirname + '/logs', 'r', function(err, fd) {
    if(err) {
      console.log('Logs directory does not exist. Creating one now.');
      fs.mkdirSync(__dirname + '/logs');
    }

    exec('nohup redis-server redis.conf >/dev/null 2>&1&', {}, function (error, stdout, stderr) {
      if (error) {
        console.log('-------ERROR-------');
        console.log(error);
      }
    });
  }));
});

gulp.task('stop-redis', function() {
  exec('redis-cli SHUTDOWN', {}, function (error, stdout, stderr) {
    if (error) {
      console.log('-------ERROR-------');
      console.log(error);
    }
  });
});

gulp.task("app", function(){
  var options = {
    url: "http://localhost:" + nconf.get('app:ports:http'),
    app: "google chrome"
  };
  gulp.src("./app.js")
  .pipe(open("", options));
});

gulp.task('default', ['server', 'scripts', 'watch', 'app']);
