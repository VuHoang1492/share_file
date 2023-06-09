
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
const joinHome = async (socket) => {
    fetch('https://api.ipify.org/?format=json')
        .then(response => response.json())
        .then(data => {
            const publicIP = data.ip;
            console.log(publicIP);
            const home = {
                ip: publicIP,
                type: 'HOME'
            }
            socket.send(JSON.stringify(home))
        })
        .catch(error => {
            console.log(error);
            window.location.replace('/error')
        });
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
    //onReceving(user)

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

    peer.on('close', () => {
        console.log('Peer close');
    })

    peer.on('connection', function (conn) {
        conn.on('open', function () {
            // Receive messages
            conn.on('data', async (data) => {
                recvData(data).then(blob => {
                    dowloadFile(blob)
                    onSuccessRecv(user)
                    conn.send({ type: 'GET_ALL' })
                    conn.close()
                    peer.destroy()
                })

            });
        });
        conn.on('close', () => {
            console.log('conn close');
        })

    });

    const recvData = (data) => {
        return new Promise((res, rej) => {
            if (totalSize === 0) {
                totalSize = data.size
            } else {
                if (data.byteLength) {
                    dataRecv.push(data)
                    recvSize += data.byteLength
                    onReceving(user, recvSize, totalSize)
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

    // onSending(user, 0, 100)
    const userCard = document.getElementById(user.id)
    const files = userCard.getElementsByTagName('input')[0].files
    var peer = new Peer();

    peer.on('open', function (id) {
        var conn = peer.connect(peer_id);
        console.log("my id: ", id);
        conn.on('open', async () => {
            const blob = await onCompressionFile(files)
            conn.send({ size: blob.size })
            sendData(user, blob, conn).then((e) => {
                console.log(e);
                console.log("Data is sent");
                onSuccess(user)
            }).catch((err) => {
                console.log(err);
                if (err instanceof Error && err.message.includes('Invalid length')) {
                    // Error is an "Invalid length" error
                    console.log('Invalid length error occurred');
                    console.log("Data is sent");
                    onSuccess(user)
                }

            })


            conn.on('data', (data) => {
                if (data.type === 'GET_ALL') {
                    conn.close()
                    peer.destroy()
                }

            });


        });
        conn.on('close', () => {
            console.log('conn close');
        })

        peer.on('close', () => {
            console.log('Peer close');
        })

    });

}

// nén file
const onCompressionFile = (files) => {
    console.log(files);
    let zip = new JSZip()
    Array.from(files).forEach(file => {
        zip.file(file.name, file, { base64: true })
    })
    return zip.generateAsync({ type: 'blob' })
}

const sendData = (user, blob, channel) => {
    return new Promise((res, rej) => {
        let offset = 0;


        const blockSize = 16384
        console.log(blob.size);
        console.log(blob.size / blockSize);

        const reader = new FileReader()
        reader.addEventListener('error', error => rej(error));
        reader.addEventListener('abort', event => console.log('File reading aborted:', event));
        reader.onloadend = (e) => {
            onSending(user, offset, blob.size)
            try {
                channel.send(e.target.result)
            } catch (error) {
                rej(error)
            }

            if (offset < blob.size) {

                offset += blockSize;
                console.log(offset);
                const nextBlock = blob.slice(offset, offset + blockSize);
                reader.readAsArrayBuffer(nextBlock)

            } else {
                res("Success")
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