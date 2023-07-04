function heartbeat() {
    clearTimeout(this.pingTimeout);
    this.pingTimeout = setTimeout(() => {
        this.terminate();
    }, 3000);
}

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
            heartbeat;
        }
    }
    else {
        //Truyen file trong local 
        client.onopen = () => {
            joinHome(client)
            heartbeat;
        }

    }
    client.onclose = () => {
        console.log("Close socket");
        clearTimeout(this.pingTimeout);
    }
    client.onerror = (err) => {
        console.log(err);
    }
    client.onping = heartbeat;
    client.addEventListener('message', (e) => {
        const mes = JSON.parse(e.data)

        if (mes.type === 'ATHU') { createCardUser(mes, client) }
        if (mes.type === 'GUEST') {
            listUser.push(mes)
            createCardUser(mes, client)
            console.log(listUser);

        }

        if (mes.type === 'REQUEST_SEND') {
            listUser.forEach(user => {
                if (user.id === mes.id)
                    onGetRequestSend(user, client);
            })

        }
        if (mes.type === 'ACCEPT' || mes.type === 'DECLINE') {
            listUser.forEach(user => {
                if (user.id === mes.id)
                    if (mes.type === 'ACCEPT') {
                        console.log(mes);
                        sendFile(user, mes.peer_id)
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
    })

}





