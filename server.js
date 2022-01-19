const http=require("http");
const express=require("express");
var session=require('express-session');
const ejs=require("ejs");
const socketio=require("socket.io");
const sha1= require("sha1");
const app= express();
const server=http.createServer(app);
const port=3000;
const {joinUser, getRoomUsers,userLeave,getCurrentUser}=require('./utils/users.js');
const {formatMessage}=require('./utils/messages.js');
//socket io server
const io=socketio(server);
const mysql=require('mysql');
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:true
}))

const pool=mysql.createPool({
    host:'localhost',
    user:'root',
    password:'',
    database:'214szft_chatapp'
});

pool.getConnection((err,connection)=>{
    if(err)throw err;
    console.log("Connected to database Connid:"+connection.threadId);
});

app.get('/',(req,res)=>{
    let hiba="";
    res.render('index',{hiba});
});
app.get("/register",(req,res)=>{
    let hiba='';
    res.render("register",{hiba});
});

app.post("/reg",(req,res)=>{
    let hiba="";
    let username=req.body.username;
    let passwd1=req.body.passwd1;
    let passwd2=req.body.passwd2;
    pool.query(`SELECT * FROM felhasznalok WHERE nev='${username}'`,(err,results)=>{
        if (err) throw err;
        if (results.length!=0) {
            hiba='A felhasználó létezik';
            res.render('register',{hiba});
        }
        else{
            if (passwd1!=passwd2) {
                hiba='A jelszavak nem eggyeznek';
                res.render('register',{hiba});
            }
            else{
                pool.query(`INSERT INTO felhasznalok VALUES(null,'${username}',SHA1('${passwd1}'))`,(err)=>{
                    if(err)throw err;
                    let hiba='';
                    res.render('index',{hiba});
                });
            }
        }
    });
});
app.post("/chat",(req,res)=>{
    let hiba="";
    let username=req.body.nickname;
    let password=req.body.password;
    pool.query(`SELECT * FROM felhasznalok WHERE nev='${username}' AND jelszo=SHA1('${password}')`,(err,results)=>{
        if(err)throw err;
        if(results.length!=0)
        {
            session.nickname=req.body.nickname;
            session.roomname=req.body.room;
            res.render('chat');
        }
        else
        {
            hiba="Nem megfelelőek az adatok";
            res.render('index',{hiba});
        }

    });
});

io.on('connection',(socket)=>{
    //console.log('Socket connected...'+socket.id);
    //client connected to room
    socket.on('JoinToRoom',()=>{
        const user=joinUser(socket.id,session.nickname,session.roomname);

        //join the room
        socket.join(user.room);
    
        //console.table(user);
        //update room info
        io.to(user.room).emit('updateRoom',session.roomname,getRoomUsers(session.roomname));

        //wellcome current user
        socket.emit('message',formatMessage('Sytem',`Welcome to the ${user.room}!`));

        //broadcast another user 
        //users.js ből jön a .name  mert onnan vettük , ezért jön vele a user.name
        socket.to(user.room).emit('message',formatMessage('Sytem',`${user.name} joined to the room!`));    
    });

    //listen for messages
    socket.on('message',(msg)=>{
        //broadcast to another user and self to
        //lekérjük hogy éppenséggel melyik user küldte az üzenetet, az a socket 
        //amin beérkezik, azaz socket.io (ha minden igaz)!?
        const user=getCurrentUser(socket.id);
        pool.query(`INSERT INTO uzenetek VALUES('${user.room}','${user.name}',CURRENT_TIMESTAMP,${msg})`)
        io.to(user.room).emit('message',formatMessage(user.name,msg));
    });

    //2 class incoming és outgoing, server emitál  atadjuk hogy out vagy in ,kliens fogadja, outputmessage ba, és ott attól függően színez
    // le kéne tárolni az adatbázisban
    //de ez így nem jó
    //login, logout és mysql kapcsolat is kell bele, azt hiszem az autókölcsönzőből ki lehet szedni
    //css válltoztatása

    //when anybody typing....
    socket.on('typing',(id)=>{
        const user= getCurrentUser(id);
        socket.to(user.room).emit('typing',`${user.name} is typing...`);
    });


    //client leave room
    socket.on('disconnect',()=>{
        const user=userLeave(socket.id);

        //broadcast to another users
        io.to(user.room).emit('message',formatMessage('System',`${user.name} has left the room.`));

        //update room information to another users
        io.to(user.room).emit('updateRoom',user.room,getRoomUsers(user.room));
    });
});

server.listen(port,()=>{
    console.log(`Server is listening on port:${port}...`);

});
