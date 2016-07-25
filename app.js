// Module dependencies.

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var app = module.exports = express();

app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.use('/', routes.index);

var server = app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io')(server);
//var redis = require('socket.io-redis');
//io.adapter(redis({ host: 'localhost', port: 6379 }));


var redis2 = require("redis");

var pub = redis2.createClient();
var sub = redis2.createClient();

io.sockets.on('connection', function(socket) {
  socket.on('message', function(data) {
    console.log("Recieving message " + data + " and broadcasting it...");
    pub.publish("analytics", data);
  });
});



sub.on("subscribe", function(channel, count) {
    console.log("Subscribed to " + channel + ". Now subscribed to " + count + " channel(s).");
});

sub.on("message", function(channel, message) {
    console.log("Message from channel " + channel + ": " + message);
});

sub.subscribe("analytics");

