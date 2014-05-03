var winston = require('winston')
  , express = require('express')
  , expressWinston = require('express-winston')
  , path = require('path')
  , fs = require('fs')
  , http = require('http')
  , https = require('https')
  , redis = require('redis')
  , session = require('express-session')
  , RedisStore = require('connect-redis')(session)
  , url = require('url')
  , nconf = require('nconf')
  ;

module.exports = function(app) {
  nconf.argv().env().file({ file: path.join(__dirname, 'config.json') });

  app.set('config', nconf);

  // set up http and https servers
  var privateKey  = fs.readFileSync(path.join(__dirname, '..', 'sslcert/server.key'), 'utf8');
  var certificate = fs.readFileSync(path.join(__dirname, '..', 'sslcert/server.crt'), 'utf8');
  var credentials = { key: privateKey, cert: certificate };

  app.set('http port', process.env.HTTP_PORT || nconf.get('app:ports:http'));
  app.set('https port', process.env.HTTPS_PORT || nconf.get('app:ports:https'));

  var httpServer = http.createServer(app);
  var httpsServer = https.createServer(credentials, app);

  httpServer.listen(app.get('http port'));
  httpsServer.listen(app.get('https port'));

  app.set('http server', httpServer);
  app.set('https server', httpsServer);

  // Custom middleware to redirect all http requests to https
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

  // set up template engine
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'jade');

  // set up socket.io
  app.set('sio', require('socket.io').listen(httpsServer));

  // log('Setting static files lookup root path.');
  app.use(express.static(path.join(__dirname, '..', '/public')));

  // log('Opening a redis client connection');
  var redisConfig = url.parse(nconf.get('redis:url'));
  var redisClient = redis.createClient(redisConfig.port, redisConfig.hostname);

  redisClient
  .on('error', function(err) {
    console.log('Error connecting to redis %j', err);
  }).on('connect', function() {
    console.log('Connected to redis.');
  }).on('ready', function() {
    console.log('Redis client ready.');
  });

  // log('Saving redisClient connection in app');
  app.set('redisClient', redisClient);

  // log('Creating and saving a session store instance with redis client.');
  app.set('sessionStore', new RedisStore({client: redisClient}));

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
        json: true
        , colorize: true
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
