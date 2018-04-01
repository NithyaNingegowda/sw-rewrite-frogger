var express = require('express');
var app = express();
app.use(express.static(__dirname + '/frontend-nanodegree-arcade-game/')); //__dir and not _dir
var port = 8000; // you can use any port
app.listen(port);
console.log('server on ' + port);