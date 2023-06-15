
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




const addCandidate = async (user, candidate) => {
    await user.peer.addIceCandidate(candidate)
    return
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

    const local_peer = user.peer
    const local_dataChannel = local_peer.createDataChannel(`dataChannel for ${user.id}`);
    user.channel = local_dataChannel

    local_dataChannel.onmessage = receiveMessage;
    local_dataChannel.onopen = () => console.log('Data channel opened');
    local_dataChannel.onclose = () => console.log('Data channel closed');

    local_peer.addEventListener('icecandidate', event => {
        // console.log('Local ICE candidate: ', event.candidate);
        const candidateMes = {
            id: user.id,
            type: 'CANDIDATE',
            candidate: event.candidate
        }
        client.send(JSON.stringify(candidateMes))
    });



    local_peer.createOffer()
        .then(offer => {
            local_peer.setLocalDescription(offer)
                .then(() => {

                    const signal = {
                        id: user.id,
                        type: 'REQUEST_SEND',
                        offer: JSON.stringify(local_peer.localDescription)
                    }
                    client.send(JSON.stringify(signal))

                })
        }).catch(err => {
            console.log(err);
        })

    onWaitAccept(userCard, user)
}



//chấp nhận nhận file và tạo kết nối peer to peer
const onAcceptGetFile = async (user, client, offer) => {

    const remote_peer = user.peer
    const dataRecv = []
    remote_peer.ondatachannel = event => {
        const remote_dataChannel = event.channel;
        remote_dataChannel.onmessage = receiveMessage
        remote_dataChannel.onopen = () => console.log('Data channel opened');
        remote_dataChannel.onclose = () => console.log('Data channel closed');
    };


    remote_peer.addEventListener('icecandidate', async event => {
        //  console.log('Local ICE candidate: ', event.candidate);
        const candidateMes = {
            id: user.id,
            type: 'CANDIDATE',
            candidate: event.candidate
        }
        client.send(JSON.stringify(candidateMes))
    });


    remote_peer.setRemoteDescription(JSON.parse(offer)).then(() => {

        remote_peer.createAnswer().then(answer => {
            remote_peer.setLocalDescription(answer)
                .then(() => {

                    const answerData = {
                        id: user.id,
                        type: 'ACCEPT',
                        answer: JSON.stringify(remote_peer.localDescription)
                    }
                    client.send(JSON.stringify(answerData))

                })

        }).catch(err => {
            console.log(err);
        })
    }).catch(err => {
        console.log(err);
    })
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
    user.channel = null
    onDecline(user)
}






const sendFile = async (user, answer) => {
    const local_peer = user.peer

    onSending(user)

    await local_peer.setRemoteDescription(JSON.parse(answer))
    const userCard = document.getElementById(user.id)
    const files = userCard.getElementsByTagName('input')[0].files

    if (files.length === 1 && files[0].type === 'application/x-zip-compressed') {
        console.log(files[0]);
        while (true) {
            if (user.channel.readyState === 'open') {
                sendData(files[0], user.channel)
                break
            }
        }
    } else {
        onCompressionFile(files).then(blob => {
            while (true) {
                if (user.channel.readyState === 'open') {
                    sendData(blob, user.channel)
                    break
                }
            }
        })
    }




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

    // console.log(blob.size);
    // // if (blob.size < 500 * 1024) {
    // //     console.log("File quá bé")
    // //     return
    // // };
    console.log(channel);
    let offset = 0;
    const blockSize = 4096
    let count = blob.size / blockSize
    console.log(count);
    const reader = new FileReader()
    reader.addEventListener('error', error => console.error('Error reading file:', error));
    reader.addEventListener('abort', event => console.log('File reading aborted:', event));
    reader.onload = () => {

        const block = new Uint8Array(reader.result);
        channel.send(block)
        if (offset < blob.size) {
            offset += blockSize;
            const nextBlock = blob.slice(offset, offset + blockSize);
            reader.readAsArrayBuffer(nextBlock)
        }
    }

    const nextBlock = blob.slice(offset, offset + blockSize);
    reader.readAsArrayBuffer(nextBlock)
}






// // chia file thanh cac khoi 4069byte
// const sliceBlob = (blob) => {
//     const blockSize = 1024
//     const blobArray = []
//     let count = blob.size / blockSize
//     console.log(count);

//     return new Promise((resolve, reject) => {
//         const reader = new FileReader()
//         reader.onloadend = () => {
//             if (reader.error) {
//                 reject(reader.error)
//             } else if (reader.readyState === FileReader.DONE) {
//                 const block = new Uint8Array(reader.result);
//                 blobArray.push(block);

//                 if (blobArray.length < count) {
//                     const offset = blobArray.length * blockSize;
//                     const nextBlock = blob.slice(offset, offset + blockSize);
//                     reader.readAsArrayBuffer(nextBlock)
//                 } else {
//                     resolve(blobArray)
//                 }
//             }
//         }
//         const offset = blobArray.length * blockSize;
//         const nextBlock = blob.slice(offset, offset + blockSize);
//         reader.readAsArrayBuffer(nextBlock)
//     })

// }




function receiveMessage(event) {
    const message = event.data;
    console.log('Received message:', message);
}


// const getData = (event, dataArr) => {
//     dataArr.push(JSON, parse(event.data))
//     console.log(dataArr);
// }