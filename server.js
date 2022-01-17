const http=require("http");
const express=require("express");
var session=require('express-session');
const ejs=require("ejs");
const socketio=require("socket.io");
const app= express();
const server=http.createServer(app);
const port=3000;
const {joinUser}=require('./user/users.js');
//socket io server
const io=socketio(server);
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:true
}))

app.get('/',(req,res)=>{
    res.render('index');
});

app.post("/chat",(req,res)=>{
    session.nickname=req.body.nickname;
    session.roomname=req.body.room;
    //console.log(nickname,roomname);
    res.render('chat');
});

io.on('connection',(socket)=>{
    //console.log('Socket connected...'+socket.id);
    //client connected to room
    socket.on('JoinToRoom',()=>{
        const user=joinUser(socket.id,session.nickname,session.roomname);
        console.table(user);
        io.emit('updateRoom',{room: session.roomname});
    });
});

server.listen(port,()=>{
    console.log(`Server is listening on port:${port}...`);

});
