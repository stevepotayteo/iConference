var winston = require('winston')
  , express = require('express')
  , expressWinston = require('express-winston')
  , path = require('path')
  , fs = require('fs')
  , http = require('http')
  , https = require('https')
  ;

module.exports = function(app) {
  // set up http and https servers
  var privateKey  = fs.readFileSync(path.join(__dirname, '..', 'sslcert/server.key'), 'utf8');
  var certificate = fs.readFileSync(path.join(__dirname, '..', 'sslcert/server.crt'), 'utf8');
  var credentials = { key: privateKey, cert: certificate };

  app.set('http port', process.env.HTTP_PORT || 8000);
  app.set('https port', process.env.HTTPS_PORT || 8443);

  var httpServer = http.createServer(app);
  var httpsServer = https.createServer(credentials, app);

  var https_redirect = function(req, res, next) {
    if (!req.secure) {
        var host = (req.headers.host).replace(/:\d+$/, ":" + app.get('https port'));
        var destination = ['https://', host, req.url].join('');

        return res.redirect(destination);
    } else {
      return next();
    }
  };

  app.use(https_redirect);

  httpServer.listen(app.get('http port'));
  httpsServer.listen(app.get('https port'));

  app.set('http server', httpServer);
  app.set('https server', httpsServer);

  // set up template engine
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'jade');

  // set up socket.io
  app.set('sio', require('socket.io').listen(httpsServer));

  // log('Setting static files lookup root path.');
  app.use(express.static(path.join(__dirname, '..', '/public')));

  // set up loggers
  app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true
        , colorize: true
      })
      , new winston.transports.File({
        json: true
        , colorize: true
        , filename: path.join(__dirname, '..', '/logs/app.json')
      })
    ]
  }));

  app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      })
      , new winston.transports.File({
        json: true
        , colorize: true
        , filename: path.join(__dirname, '..', '/logs/error.json')
      })
    ]
  }));
}
;
