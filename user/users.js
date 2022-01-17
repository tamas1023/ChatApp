const users=[];

//join user to chat
function joinUser(id,name,room) {
    const user={id,name,room};
    users.push(user);
    return users;
}
module.exports={
    joinUser
};