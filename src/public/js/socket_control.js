
//kiểm tra browser
const checkSupport = () => {
    return 'File' in window && 'FileReader' in window && 'FileList' in window && 'Blob' in window && 'WebSocket' in window;
}

//Gửi thông tin room cho ws-server
const createRoom = (roomId, socket) => {
    const room = {
        id: roomId,
        type: 'ROOM'
    }
    socket.send(JSON.stringify(room))
}

//Gửi tín hiệu gửi file
const onSendSignal = (user,client) =>{
    const userCard = document.getElementById(user.id);
    const fileInput = userCard.getElementsByTagName('input');


    const fileList = fileInput[0].files
    if(fileList.length === 0){
        onAlertNoFile(userCard)
        return
    }
    if(user.room != null){
        const signal ={
            room : user.room,
            id:user.id,
            type: 'REQUEST_SEND'
        }
        client.send(JSON.stringify(signal))
        onWaitAccept(userCard,user)
    }
}

//chấp nhận nhận file
const onAcceptGetFile =(user,client)=>{
    console.log("accept");
    const accept ={
        id:user.id,
        type:'ACCEPT',
        room:user.room
    }
    client.send(JSON.stringify(accept))

} 


//Từ chối nhận file
const onDeclineGetFile =(user,client)=>{
    console.log("decline");  
    const decline ={
        id:user.id,
        type:'DECLINE',
        room:user.room
    }
    client.send(JSON.stringify(decline))
} 

//Gửi file
const sendFile =(user,client)=>{
    
}