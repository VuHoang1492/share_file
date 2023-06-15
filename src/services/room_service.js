const db = require('../configs/databaseConfig')
const { doc, collection, getDocs, setDoc, where, query, deleteDoc } = require('firebase/firestore/lite')


const addUserRoom = async (user) => {
    await setDoc(doc(db, 'user-room', user.id), user)
}

const deleteUserRoom = async (id) => {
    await deleteDoc(doc(db, "user-room", id));
}

const getUserInRoom = async (room) => {
    const q = query(collection(db, "user-room"), where("room", "==", room));

    const querySnapshot = await getDocs(q);
    const listUser = []
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        listUser.push(doc.data())
    });
    return listUser
}
const getUserById = () => {

}
module.exports = { addUserRoom, getUserInRoom, deleteUserRoom, getUserById }