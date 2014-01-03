window.onload = function() {
    document.createElement('sysmsg');
    var socket = io.connect("http://localhost:3000/");
    var input = document.getElementById("input");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var userName = "";
    socket.on('changeName', function(data){
        userName = data.name;
    });
    socket.on('message', function (data) {//process commands here
        if(data.message) {
            var msg = data.message;
            $( "#content" ).append( "" + (data.username? data.username + ": " : "") + msg + "<br>" );
            content.scrollTop = content.scrollHeight;

        } else {
            console.log("There is a problem:", data);
        }
    });
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
    nameAvaliable = function(name) {
        return true;
    };

    processCommand = function(input) {
        var command = input[0].substring(1, input[0].length).toLowerCase();
        switch(command) {
            case 'username':
            input.shift();
            if (nameAvaliable(input.join(' '))){
                socket.emit('send', {message: "<sysmsg>SystemMsg: " + userName + " has changed their name to " + input.join(' ') + "</sysmsg>"});
                socket.emit('requestName', {name: input.join(' ')});


            } else {
                $( "#content" ).append("<sysmsg>SystemMsg: nickname " + input.join(' ') + " is not avaliable.<br></sysmsg>");

            }
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
$(document).ready(function() {
    $("#input").keyup(function(e) {
        if(e.keyCode == 13) {
            send();
        }
    });
});
