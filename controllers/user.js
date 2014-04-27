module.exports.controller = function(app) {
  app.get('/', function(req, res) {
    res.render('index')
  });

  app.get('/signup', function(req, res) {
    res.render('index')
  });

  app.get('/login', function(req, res) {
    res.render('index')
  });
}