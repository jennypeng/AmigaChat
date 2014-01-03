//dependencies
var express = require("express");
var app = require('express')();
var port = 3000;
var userNum = 1;
var takenNames = [];
var usedNames = []; //bitvector representing whether num is used or not

app.use(express.static(__dirname + '/public'));
var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

app.set('views', __dirname + '/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
    res.render("page");
});
nameAvaliable = function(name) {
    for (var i = 0; i < takenNames.length; i++) {
        if (takenNames[i] == name) {
            return false;
        } else {
            takenNames.push(name);
            return true;
        }
    }
    return true;
}

io.sockets.on('connection', function (socket) {
    console.log("connected: " + socket.id);
    socket.on('disconnect', function() { 
        console.log(socket.id + ' disconnected');
        //remove user from db
    });
	socket.emit('changeName', {name: "User" + userNum});
    socket.emit('message', { message: '<sysmsg> SystemMsg: welcome to the chat</sysmsg>' , intro: true});
    socket.emit('message', { message: '<sysmsg> SystemMsg: type \/help for a list of commands</sysmsg>', intro: true});
    io.sockets.emit('message' , {message: "<sysmsg> SystemMsg: User" + userNum + " has joined the chat.</sysmsg>"});
    userNum ++;
    //handle message sending
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
    //handle name changing
    socket.on('requestName', function (data) {
    	socket.emit('changeName', data);
    });
    //socket.on('nameAvaliable', function (data) {
    //	namesUsed.indexOf(name) == -1;
    //})
});