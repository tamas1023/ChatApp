const users=[];

//join user to chat
function joinUser(id,name,room) {
    const user={id,name,room};
    users.push(user);
    return user;
}

//get current user
function getCurrentUser(id) {
    return users.find(user=>user.id===id);
}

//get all user from room
function getRoomUsers(room) {
    return users.filter(user =>user.room === room)
}

//user leave the room
function userLeave(id) {
    const index=users.findIndex(user=>user.id===id);
    if (index!==-1) {
        return users.splice(index,1)[0];
    }
    
}

module.exports={
    joinUser,
    getRoomUsers,
    userLeave,
    getCurrentUser
};