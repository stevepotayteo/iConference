var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send('Hello test');
});

app.listen(3000);