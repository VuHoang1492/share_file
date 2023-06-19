//iceserver cho kết nối peer to peer
var configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },

    ]
};
const socketClient = (roomId, path) => {
    if (!checkSupport()) {
        onRenderBrowserNotSupport();
        return
    }


    const listUser = [];
    const client = new WebSocket(path);

    if (roomId != null) {
        //Truyen file trong room
        client.onopen = () => {
            createRoom(roomId, client);
        }
    }
    else {
        //Truyen file trong local 
        client.onopen = () => {
            joinHome(client)
        }

    }
    client.onclose = () => {
        console.log("Close socket");
    }
    client.onerror = (err) => {
        console.log(err);
    }
    client.addEventListener('message', (e) => {
        const mes = JSON.parse(e.data)

        if (mes.type === 'ATHU') { createCardUser(mes, client) }
        if (mes.type === 'GUEST') {
            const peer = new RTCPeerConnection(configuration)
            const user = { ...mes, peer: peer, channel: null }

            listUser.push(user)
            createCardUser(user, client)
            console.log(listUser);

        }

        if (mes.type === 'REQUEST_SEND') {
            listUser.forEach(user => {
                if (user.id === mes.id)
                    onGetRequestSend(user, client, mes.offer);
            })

        }
        if (mes.type === 'ACCEPT' || mes.type === 'DECLINE') {
            listUser.forEach(user => {
                if (user.id === mes.id)
                    if (mes.type === 'ACCEPT') {
                        sendFile(user, mes.answer)
                    }
                if (mes.type === 'DECLINE') {
                    onReqSendFileFailed(user)
                }
            })
        }
        if (mes.type === 'CLOSE') {
            listUser.forEach(user => {
                if (user.id === mes.id)
                    listUser.pop(user)
            })
            onDeleteUserCard(mes.id)
        }
        if (mes.type === 'CANDIDATE') {
            listUser.forEach(async user => {
                if (user.id === mes.id)
                    await addCandidate(user, mes.candidate)
            })
        }

    })

}





