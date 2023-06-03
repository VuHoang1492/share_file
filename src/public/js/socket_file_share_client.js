
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
        client.onclose= () => {
            console.log("Close socket");
        }
        client.onerror = (err) => {
            console.log(err);
        }
        client.addEventListener('message', (e) => {
            console.log('Get Message!!')
            const mes = JSON.parse(e.data)
            if (mes.type === 'ATHU' || mes.type === 'GUEST') {
                createCardUser(mes,client)
                if(mes.type === 'GUEST')
                    listUser.push(mes)
            }
            if(mes.type === 'REQUEST_SEND'){
                listUser.forEach(user=>{
                    if(user.id === mes.id)
                    onGetRequestSend(user,client);
                })
                
            }
            if(mes.type === 'ACCEPT' || mes.type ==='DECLINE'){
                listUser.forEach(user=>{
                    if(user.id === mes.id)
                        if(mes.type === 'ACCEPT'){
                            sendFile(user,client)
                        }
                        if(mes.type ==='DECLINE'){
                            onDecline(user)
                        }
                })
            }
            if(mes.type === 'CLOSE'){
                listUser.forEach(user=>{
                    if(user.id === mes.id)
                        listUser.pop(user)
                })
                onDeleteUserCard(mes.id)
            }
        })
    }
    else {
        //Truyen file trong local 
        client.onopen = () => {
            console.log("Create socket!!");

        }
        client.addEventListener('close', () => {
            console.log("Close Socket!!");
        })
        client.onerror = (err) => {
            console.log(err);
        }
        client.addEventListener('message', (e) => {
            console.log('Get Message!!');
            console.log(JSON.parse(e.data));

        })
    }
}





