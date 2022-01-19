let socket=io();
let roomname=document.querySelector('#roomname');
let usersList=document.querySelector('#usersList');
let chatMessages=document.querySelector('.chat-messages');
let msgTxt=document.querySelector('#msgTxt');
let sendBtn=document.querySelector('#sendBtn');
let feedbackBox=document.querySelector('#feedback');
//client connected to server
socket.emit('JoinToRoom');

//update room data
socket.on("updateRoom",(room,users)=>{
    outputName(room);
    outputUserList(users);
});

socket.on('message',(msg)=>{
    //console.log(msg);
    outputMessage(msg);
});

//send message
sendBtn.addEventListener("click",()=>{
    let msg=msgTxt.value;
    if (msg!='') {
        socket.emit('message',msg);
        msgTxt.value='';
        msgTxt.focus();
    }
})

//when user typing...
msgTxt.addEventListener('keypress',(e)=>{
    //ha entert nyomott
    if (e.keyCode==13) {
        sendBtn.click();
    }
    socket.emit('typing',socket.id);
});

//Listen for typing
socket.on('typing',(msg)=>{
    feedback(msg);
});


//Add roomname to DDM
function outputName(room) {
    roomname.innerHTML=room;
}

//Add users to DOM
function outputUserList(users) {
    usersList.innerHTML='';
    users.forEach(user => {
        const li=document.createElement('li');
        li.innerHTML=user.name;
        usersList.appendChild(li);
    });
}

//Add messages to DOM  Document Object Model
function outputMessage(message) {
    const div=document.createElement('div');
    div.classList.add('message');
    div.classList.add('animate__animated');
    div.classList.add('animate__slideInLeft');
    div.classList.add('animate__faster');
    const p=document.createElement('p');
    p.classList.add('uname');
    //a messages.js ből
    p.innerText=message.username;
    p.innerHTML+=`<span>${message.time}</span>`;
    div.appendChild(p);
    const p2=document.createElement('p');
    p2.innerText=message.text;
    div.appendChild(p2);

    chatMessages.appendChild(div);

/* ez így nézne ki
    <div class="message">
        <p class="uname">Username <span>20:45</span></p>
        <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam, eos voluptatum? Veritatis ratione consequatur quibusdam. Deserunt nobis ipsam animi? Ratione nostrum repellat praesentium architecto, error cupiditate totam quas illo vero!

        </p>
    </div>
    */
}

//Add feedback to DOM
function feedback(msg) {
    feedbackBox.innerHTML=msg;
    setTimeout(clearfeedback,1500);
}
function clearfeedback() {
    feedbackBox.innerHTML='';
}