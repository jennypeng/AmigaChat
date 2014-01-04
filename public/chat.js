window.onload = function() {
    document.createElement('sysmsg');
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
        }
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
            case 'help':
            $( "#content" ).append("<sysmsg>SystemMsg:<br>* /username [name] to change nickname <br>* /room [roomname] to change rooms <br>* /users to get list of users <br>"
                + "* /pm [user] to private message user <br></sysmsg>");
            break;
            default:
            $( "#content" ).append("<sysmsg>SystemMsg: " + command + " is not a valid command. </sysmsg><br>"); 
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
