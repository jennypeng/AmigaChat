window.onload = function() {
    document.createElement('sysmsg');
    document.createElement('pm');
    var socket = io.connect("http://localhost:3000/");
    var input = document.getElementById("input");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var userName = "";
    var sound = document.getElementById("audiotag");

    //Listener for name change feedback
    socket.on('changeName', function(data){
        if (data.joined) {//if the user has just joined
            userName = data.name;
        } else if (data.success) {
            socket.emit('send', {message: "<sysmsg>SystemMsg: " + userName + " has changed their name to " + data.name + "</sysmsg>"});
            userName = data.name;
            
        } else {
            $( "#content" ).append("<sysmsg>SystemMsg: nickname " + data.name + " is not avaliable.<br></sysmsg>");
            content.scrollTop = content.scrollHeight;
        }
    });

    //event receiver for incoming private messages
    socket.on('pm', function (data) {
        if (data.msg) {
            if (data.to) {
                $( "#content" ).append("<pm>PM to " + data.to + ": "  + data.msg + "</pm><br>");
            } else {
                sound.play();
                $( "#content" ).append("<pm>PM from " + data.from + ": " + data.msg + "</pm><br>" );
            }
        } else {
            $( "#content" ).append("<sysmsg>SystemMsg: Cannot pm empty message.</sysmsg><br>" );
        }
        content.scrollTop = content.scrollHeight;
    });
    //event receiver for incoming messages
    socket.on('message', function (data) {
        if(data.message) {
            var msg = data.message;
            sound.play();
            $( "#content" ).append( "" + (data.username? data.username + ": " : "") + msg + "<br>" );
            content.scrollTop = content.scrollHeight;

        } else {
            console.log("There is a problem:", data);
        }
    });

    //if text is submitted
    sendButton.onclick = send = function() {
        var text = input.value;
        if (text.charAt(0) == '/') {
            var cInput = text.split(" ");
            processCommand(cInput);
        } else {

            socket.emit('send', { message: text , username: userName});

        }
        input.value = "";
    };

    //parse any possible commands
    processCommand = function(input) {
        var command = input[0].substring(1, input[0].length).toLowerCase();
        switch(command) {
            case 'username':
            input.shift();
            socket.emit('requestName', {name: input.join(' ')});
            break;
            case 'pm':
            input.shift();
            var to = input[0];
            input.shift();
            var msg = input.join(" ");
            socket.emit('sendpm', {receiver: to, msg: msg, sender: userName});
            break;
            case 'users':
            socket.emit('users', {});
            break;
            case 'help':
            $( "#content" ).append("<sysmsg>SystemMsg:<br>* /username [name] to change nickname <br>* /room [roomname] to change rooms <br>* /users to get list of users <br>"
                + "* /pm [user] [msg] to private message user with msg contents<br></sysmsg>");
            content.scrollTop = content.scrollHeight;
            break;
            default:
            $( "#content" ).append("<sysmsg>SystemMsg: " + command + " is not a valid command. </sysmsg><br>"); 
            content.scrollTop = content.scrollHeight;
            return input;
            break;
        }


    };

}

//allows the user to press enter instead of mouse click
$(document).ready(function() {
    $("#input").keyup(function(e) {
        if(e.keyCode == 13) {
            send();
        }
    });
});
