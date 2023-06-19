
//kiểm tra browser
const checkSupport = () => {
    return 'File' in window && 'FileReader' in window && 'FileList' in window && 'Blob' in window && 'WebSocket' in window && 'RTCDataChannel' in window && 'RTCPeerConnection' in window;
}
//iceserver cho kết nối peer to peer
var configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },

    ]
};

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




const addCandidate = async (user, candidate) => {
    return await user.peer.addIceCandidate(candidate)
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
    local_dataChannel.binaryType = 'arraybuffer';

    local_dataChannel.onmessage = (e) => {
        const mes = JSON.parse(e.data)
        console.log(mes);
        if (mes.type === 'GET_ALL') {
            local_dataChannel.close()
            user.peer.close()
            user.peer = new RTCPeerConnection(configuration)
        }
    };
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
    onReceving(user)
    console.log("accept");

    const remote_peer = user.peer
    const dataRecv = []
    let totalSize = 0
    let recvSize = 0
    let reallySize = 0
    remote_peer.ondatachannel = event => {
        const remote_dataChannel = event.channel;
        remote_dataChannel.binaryType = 'arraybuffer'
        remote_dataChannel.onmessage = (e) => {
            recvData(e).then(blob => {


                dowloadFile(blob)
                onSuccessRecv(user)
                remote_dataChannel.send(JSON.stringify({ type: 'GET_ALL' }))
                remote_dataChannel.close()
                user.peer.close()
                user.peer = new RTCPeerConnection(configuration)



            })
        }
        remote_dataChannel.onopen = () => console.log('Data channel opened');
        remote_dataChannel.onclose = () => console.log('Data channel closed');
    };


    remote_peer.addEventListener('icecandidate', async event => {
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
    console.log(remote_peer);

    const recvData = (e) => {
        return new Promise((res, rej) => {
            if (totalSize === 0 && reallySize === 0) {
                sizeData = JSON.parse(e.data)
                totalSize = sizeData.sendSize
                reallySize = sizeData.reallySize
                console.log(totalSize, reallySize);
            } else {
                if (e.data.byteLength) {
                    console.log(e.data);
                    dataRecv.push(e.data)
                    recvSize += e.data.byteLength
                    //  console.log(recvSize);
                    if (recvSize === totalSize) {

                        console.log("complete");
                        const received = new Blob(dataRecv);
                        if (totalSize = reallySize) {
                            res(received)

                        } else {
                            const fileBlob = receivedBlob.slice(0, reallySize);
                            res(fileBlob)

                        }
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
    WaitChannelOpen(user.channel).then(channel => {
        channel.close()
        user.channel = null
    })
    onDecline(user)
}






const sendFile = async (user, answer) => {
    const local_peer = user.peer

    onSending(user)


    await local_peer.setRemoteDescription(JSON.parse(answer))
    console.log(local_peer);
    const userCard = document.getElementById(user.id)
    const files = userCard.getElementsByTagName('input')[0].files
    setInterval(() => {
        console.log(user.channel.readyState);
    }, 2000)
    const blob = await onCompressionFile(files)
    const reallySize = blob.size
    const targetSize = 500 * 1024

    if (reallySize < targetSize) {
        const sizeDifference = targetSize - reallySize;
        console.log(sizeDifference);
        const additionalData = new Uint8Array(sizeDifference);
        const extendedBlob = new Blob([blob, additionalData]);
        const sendSize = extendedBlob.size



        WaitChannelOpen(user.channel).then(channel => {

            channel.send(JSON.stringify({ reallySize: reallySize, sendSize: sendSize }))
            return channel
        }).then(channel => {
            console.log("start");
            sendData(extendedBlob, channel).then(c => {
                onSuccess(user)
                // c.close()
                // user.peer.close()
                // user.peer = new RTCPeerConnection(configuration)


            })
        })

    } else {
        WaitChannelOpen(user.channel).then(channel => {

            channel.send(JSON.stringify({ reallySize: reallySize, sendSize: reallySize }))
            return channel
        }).then(channel => {
            console.log("start");
            sendData(blob, channel)
                .then(c => {
                    onSuccess(user)
                    // c.close()
                    // user.peer.close()
                    // user.peer = new RTCPeerConnection(configuration)


                })
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


const WaitChannelOpen = (channel) => {
    return new Promise((res, rej) => {
        const checkReadyState = () => {
            if (channel.readyState === 'open') {
                console.log("Channel is open");
                res(channel);
            } else {
                setTimeout(checkReadyState, 100); // Kiểm tra lại sau 100ms
            }
        };

        checkReadyState();
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