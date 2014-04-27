// Reference: http://timstermatic.github.io/blog/2013/08/17/a-simple-mvc-framework-with-node-and-express/

var express = require('express')
      , app = express()
      , fs = require('fs')
      ;

require('./config')(app);

// dynamically include routes (Controller)
fs.readdirSync('./controllers').forEach(function (file) {
  if(file.substr(-3) == '.js') {
      route = require('./controllers/' + file);
      route.controller(app);
  }
});
