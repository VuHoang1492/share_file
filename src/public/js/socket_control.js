
//kiểm tra browser
const checkSupport = () => {
    return 'File' in window && 'FileReader' in window && 'FileList' in window && 'Blob' in window && 'WebSocket' in window && 'RTCDataChannel' in window && 'RTCPeerConnection' in window;
}


//Gửi thông tin room cho ws-server
const createRoom = (roomId, socket) => {
    const room = {
        id: roomId,
        type: 'ROOM'
    }
    socket.send(JSON.stringify(room))
}

//Gửi thông tin home cho server
const joinHome = (socket) => {
    // const home = {
    //     id: ipPublic,
    //     type: 'HOME'
    // }
    // socket.send(JSON.stringify(home))
}

//Gửi tín hiệu gửi file
const onSendSignal = (user, client) => {
    const userCard = document.getElementById(user.id);
    const fileInput = userCard.getElementsByTagName('input');


    const fileList = fileInput[0].files
    if (fileList.length === 0) {
        onAlertNoFile(userCard, user)
        return
    }

    const signal = {
        id: user.id,
        type: 'REQUEST_SEND'
    }
    client.send(JSON.stringify(signal))

    onWaitAccept(userCard, user)
}



//chấp nhận nhận file và tạo kết nối peer to peer
const onAcceptGetFile = async (user, client) => {
    onReceving(user)

    var peer = new Peer();
    const dataRecv = []
    let totalSize = 0
    let recvSize = 0

    peer.on('open', function (id) {
        console.log('My peer ID is: ' + id);
        const accept = {
            type: 'ACCEPT',
            id: user.id,
            peer_id: id
        }
        client.send(JSON.stringify(accept))
    });

    peer.on('connection', function (conn) {
        conn.on('open', function () {
            // Receive messages
            conn.on('data', async (data) => {
                recvData(data).then(blob => {
                    dowloadFile(blob)
                })

            });
        });
    });

    const recvData = (data) => {
        return new Promise((res, rej) => {
            if (totalSize === 0) {
                totalSize = data.size
            } else {
                if (data.byteLength) {
                    dataRecv.push(data)
                    recvSize += data.byteLength
                    if (recvSize === totalSize) {
                        console.log("complete");
                        const received = new Blob(dataRecv);
                        res(received)
                    } else {
                        rej("Waiting...")
                    }
                }
            }
        })
    }

}


//Từ chối nhận file
const onDeclineGetFile = (user, client) => {
    console.log("decline");
    const decline = {
        id: user.id,
        type: 'DECLINE'
    }
    client.send(JSON.stringify(decline))
}
const onReqSendFileFailed = (user) => {
    onDecline(user)
}



const sendFile = async (user, peer_id) => {

    onSending(user)
    const userCard = document.getElementById(user.id)
    const files = userCard.getElementsByTagName('input')[0].files
    var peer = new Peer();
    peer.on('open', function (id) {
        var conn = peer.connect(peer_id);
        conn.on('open', async () => {
            const blob = await onCompressionFile(files)
            await conn.send({ size: blob.size })
            await sendData(blob, conn)
        });
    });
}

// nén file
const onCompressionFile = (files) => {
    let zip = new JSZip()
    Array.from(files).forEach(file => {
        zip.file(file.name, file)
    })
    return zip.generateAsync({ type: 'blob' })
}

const sendData = (blob, channel) => {
    return new Promise((res, rej) => {
        let offset = 0;
        const blockSize = 16384
        console.log(blob.size / blockSize);
        const reader = new FileReader()
        reader.addEventListener('error', error => console.error('Error reading file:', error));
        reader.addEventListener('abort', event => console.log('File reading aborted:', event));
        reader.onload = (e) => {
            channel.send(e.target.result)
            if (offset < blob.size) {
                offset += blockSize;
                const nextBlock = blob.slice(offset, offset + blockSize);
                reader.readAsArrayBuffer(nextBlock)
            } else {
                res(channel)
            }
        }
        const nextBlock = blob.slice(offset, offset + blockSize);
        reader.readAsArrayBuffer(nextBlock)
    })
}




const dowloadFile = (blob) => {

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dowload.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}