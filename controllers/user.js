module.exports.controller = function(app) {
  app.get('/', function(req, res) {
    res.render('index');
  });

  app.get('/signup', function(req, res) {
    res.render('index');
  });

  app.get('/login', function(req, res) {
    res.render('index');
  });

  var sio = app.get('sio');

  sio.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
    console.log(data);
  });
});
};
