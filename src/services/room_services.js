const UserInRoom = {}

const addUserInRoom = (user) => {
    const room = user.room
    if (UserInRoom.hasOwnProperty(room)) {
        (UserInRoom[room]).push(user)
    } else {
        UserInRoom[room] = []
        UserInRoom[room].push(user)
    }
}

const deleteUserInRoom = (room, id) => {

    const length = UserInRoom[room].length
    if (length > 1) {

        let index
        for (index = 0; index < UserInRoom[room].length; index++) {
            if ((UserInRoom[room])[index].id === id) break;
        }
        UserInRoom[room].splice(index, 1);
    } else {
        delete UserInRoom[room]
    }
}

const getRoom = (room) => {
    return UserInRoom[room]
}

module.exports = { addUserInRoom, deleteUserInRoom, getRoom }