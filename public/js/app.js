let socket=io();
let roomname=document.querySelector('#roomname');
//client connected to server
socket.emit('JoinToRoom');

//update room data
socket.on("updateRoom",(room)=>{
    outputName(room);
});

//Add roomname to DDM
function outputName(room) {
    roomname.innerHTML=room;
}