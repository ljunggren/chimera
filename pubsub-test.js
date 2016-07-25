
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

var socketio = require("socket.io")
var redis = require("redis")

// redis clients
var store = redis.createClient()
var pub = redis.createClient()
var sub = redis.createClient()

// ... application paths go here

var socket = socketio.listen(app)

sub.subscribe("chat")

socket.on("connection", function(client){
  client.send("welcome!")

  client.on("message", function(text){
    store.incr("messageNextId", function(e, id){
      store.hmset("messages:" + id, { uid: client.sessionId, text: text }, function(e, r){
        pub.publish("chat", "messages:" + id)
      })
    })
  })

  client.on("disconnect", function(){
    client.broadcast(client.sessionId + " disconnected")
  })

  sub.on("message", function(pattern, key){
    store.hgetall(key, function(e, obj){
      client.send(obj.uid + ": " + obj.text)
    })
  })

})