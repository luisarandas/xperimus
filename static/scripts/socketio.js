document.addEventListener('DOMContentLoaded', () => {
    var socket = io.connect('http://' + document.domain + ":" + location.port);

    let room = "Lounge";
    joinRoom("Lounge");

    /*socket.on('connect', () => {
        socket.send("I am connected!!!");
    });*/

    /* Display Incoming Messages */

    socket.on('message', data => {
        const p = document.createElement("p");
        const span_username = document.createElement("span");
        const span_timestamp = document.createElement("span");
        const br = document.createElement("br");

        if (data.username) {
            span_username.innerHTML = data.username;
            span_timestamp.innerHTML = data.time_stamp;
            p.innerHTML = span_username.outerHTML + br.outerHTML + data.msg + br.outerHTML + span_timestamp.outerHTML + br.outerHTML; //msg on socket.send
            document.querySelector("#display-message-selection").append(p);
        } else {
            printSysMsg(data.msg);
        }
        //console.log(`Message received: ${data}`);
    });

    /*socket.on("some-event", data => {
        console.log(data);
        socket.emit("my-event", { data: "I\'m connected!" });
    });*/

    // Send message
    document.querySelector("#send_message").onclick = () => {
        socket.send({ "msg": document.querySelector("#user_message").value, "username": username, "room": room });
        // Clear
        document.querySelector("#user_message").value = "";

    }

    // Room selection
    document.querySelectorAll(".select-room").forEach(p => {
        p.onclick = () => {
            let newRoom = p.innerHTML;
            if (newRoom == room) {
                msg = `You are already in ${room} room.`
                printSysMsg(msg);
            } else {
                leaveRoom(room);
                joinRoom(newRoom);
                room = newRoom;
            }
        }
    });
    // Leave & Join & Print
    function leaveRoom(room) {
        socket.emit("leave", { "username": username, "room": room });
    }

    function joinRoom(room) {
        socket.emit("join", { "username": username, "room": room });
        // Clear message area
        document.querySelector("#display-message-selection").innerHTML = "";
        // Autofocus
        document.querySelector("#user_message").focus();
    }

    function printSysMsg(msg) {
        const p = document.createElement("p");
        p.innerHTML = msg;
        document.querySelector("#display-message-selection").append(p);

    }



});