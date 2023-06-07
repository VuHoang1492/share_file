
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
        onAlertNoFile(userCard,user)
        return
    }

        const signal ={
            id:user.id,
            type: 'REQUEST_SEND'
        }
        client.send(JSON.stringify(signal))
        console.log("send signal");
        onWaitAccept(userCard,user)
}

//chấp nhận nhận file
const onAcceptGetFile =(user,client)=>{
    console.log("accept");
    const accept ={
        id:user.id,
        type:'ACCEPT'
    }
    client.send(JSON.stringify(accept))

} 


//Từ chối nhận file
const onDeclineGetFile =(user,client)=>{
    console.log("decline");  
    const decline ={
        id:user.id,
        type:'DECLINE'
    }
    client.send(JSON.stringify(decline))
} 

//Gửi file
const sendFile =(user,pathServer,yourId)=>{
    onSending(user)
    const userCard = document.getElementById(user.id);
    const fileInput = userCard.getElementsByTagName('input');
    const fileList = fileInput[0].files
    if(fileList.length === 1 && fileList[0].type ==='application/x-zip-compressed')
      { 
        console.log(fileList[0]);
        sliceBlob(fileList[0]).then(blockArray=>{
            sendBlock(blockArray,pathServer,user,yourId)
        })
    }else{
    onCompressionFile(fileList).then(
        res=>{   
            const file = new File([res],"test.zip",{type:res.type})
            sliceBlob(file).then(blockArray=>{
                sendBlock(blockArray,pathServer,user,yourId)
            })
        })}

    
}

// nén file
const onCompressionFile = (files)=>{
    let zip = new JSZip()
    Array.from(files).forEach(file =>{
        zip.file(file.name,file)
    })
  return  zip.generateAsync({type:'blob'})
}


// chia file thanh cac khoi 1024byte
const sliceBlob =(blob)=>{
    const blockSize = 4069
    const blobArray =[]
    let count = blob.size/blockSize
    console.log(count);
    return new Promise((resolve,reject)=>{
            const reader = new FileReader()
            reader.onloadend=()=>{
                if(reader.error){
                    reject(reader.error)
                }else if(reader.readyState === FileReader.DONE){
                            const block = new Uint8Array(reader.result);
                            blobArray.push(block);
                       
                            if(blobArray.length < count){
                                const offset = blobArray.length * blockSize;
                                const nextBlock = blob.slice(offset, offset + blockSize);
                                reader.readAsArrayBuffer(nextBlock)
                            }else{
                                resolve(blobArray)
                            }
                    }
            }
            const offset = blobArray.length * blockSize;
            const nextBlock = blob.slice(offset, offset + blockSize);
            reader.readAsArrayBuffer(nextBlock)
    })
}


//gui tung block
const sendBlock = (blockArray,pathServer,user,yourId)=>{
    const socketSendFile = new WebSocket(pathServer)
    socketSendFile.onopen = ()=>{
        console.log("Create socket send file");
        blockArray.forEach(block=>{
            socketSendFile.send(JSON.stringify({
            size: blockArray.length,
            sender_id: yourId,
            receiver_id: user.id,
            block:block,
            type:'SEND_FILE'
        }))})
        socketSendFile.close();
        onSuccess(user)
    }
    socketSendFile.onclose = ()=>{
        console.log("Close socket send file");
    }
   
}