//dependencies
var express = require("express");
var app = require('express')();
var port = 3000;
var userNum = 1;
var currentUsers = {};
var takenNames = []; 

app.use(express.static(__dirname + '/public'));
var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

app.set('views', __dirname + '/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
    res.render("page");
});


io.sockets.on('connection', function (socket) {
    console.log("connected: " + socket.id);
    socket.on('disconnect', function() { 
        console.log(socket.id + ' disconnected');
        //remove user from db
        var index = takenNames.indexOf(currentUsers[socket.id]);
        delete takenNames[index];
        delete currentUsers[socket.id];
    });

    //user initialization
    socket.emit('changeName', {name: "User" + userNum, joined: "True"});
    currentUsers[socket.id] = "User" + userNum;
    socket.emit('message', { message: '<sysmsg> SystemMsg: welcome to the chat</sysmsg>' , intro: true});
    socket.emit('message', { message: '<sysmsg> SystemMsg: type \/help for a list of commands</sysmsg>', intro: true});
    io.sockets.emit('message' , {message: "<sysmsg> SystemMsg: User" + userNum + " has joined the chat.</sysmsg>"});
    userNum ++;
    
    //handle private messages
    socket.on('sendpm', function (data) {
        var userExists = false;
        for (var key in currentUsers) {
            if (currentUsers[key] == data.sender) {
                io.sockets.socket(key).emit('pm', {to: data.receiver, msg: data.msg});
            }
        }
        for (var key in currentUsers) {
            if (currentUsers[key] == data.receiver) {
                userExists = true;
                io.sockets.socket(key).emit('pm', {from: data.sender, msg: data.msg});
            }
        }
        if (!userExists) {
            socket.emit('message', { message: '<sysmsg> SystemMsg: User ' + data.receiver + ' does not exist</sysmsg>'});
        } 
    });

    //handle message sending
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });

    //listener for name change requests
    socket.on('requestName', function (data) {
        var name = data.name;
        if (name.slice(0 , 4) == "User") {
            socket.emit('message', { message: '<sysmsg> SystemMsg: Cannot change to username starting with User</sysmsg>'});
        } else {
            for (var i = 0; i < takenNames.length; i++) {
            if (takenNames[i] == name) {//cannot have duplicate names or names that begin with guest
                socket.emit('changeName', {name: name}); //emit nothing for false value
                return;
            }
        }
        var index = takenNames.indexOf(currentUsers[socket.id]);
        delete takenNames[index];
        currentUsers[socket.id] = name;
        takenNames.push(name);
        socket.emit('changeName', {success: "True", name: name});

    }
});
});