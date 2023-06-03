const WebSocket = require('ws')
const { AvatarGenerator } = require('random-avatar-generator')
const random = require('random-name')
const { uid } = require('uid')

require('dotenv').config()

const path = process.env.SOCKET_SERVER

module.exports = socketServer = (server) => {
    const wss = new WebSocket.Server({ server: server, path: path })
    const generator = new AvatarGenerator()

    const userList = [];

    wss.on("connection", (ws, req) => {
        ws.on('message', (data) => {
            const mes = JSON.parse(data.toString())
            if (mes.type === 'ROOM') {
                ws.id = uid()
                ws.room = mes.id
                const user = {
                    name: random(),
                    avatar: generator.generateRandomAvatar(),
                    id: ws.id,
                    room: ws.room
                }
                userList.push(user)
                ws.send(JSON.stringify({ ...user, type: 'ATHU' }))
                wss.clients.forEach(client => {
                    if (client != ws) {
                        if (client.room == ws.room) {
                            client.send(JSON.stringify({ ...user, type: 'GUEST' }))

                            userList.forEach(user => {
                                if (user.id == client.id) ws.send(JSON.stringify({ ...user, type: 'GUEST' }))
                            })
                        }
                    }
                })
            }
            if(mes.type === 'REQUEST_SEND')
            {
                wss.clients.forEach(client =>{
                    if(client.id === mes.id){
                        client.send(JSON.stringify({room:mes.room, id : ws.id, type : mes.type}))
                    }
                })
            }
            if(mes.type ==='ACCEPT' || mes.type === 'DECLINE'){
                wss.clients.forEach(client =>{
                    if(client.id === mes.id){
                        client.send(JSON.stringify({room:mes.room, id : ws.id, type : mes.type}))
                    }
                })
            }
        });


        ws.on("close", () => {
                userList.forEach(user=>{
                    if(user.id === ws.id)
                        userList.pop(user)
                })
                wss.clients.forEach(client =>{
                    if(client.id != ws.id){
                        if(client.room === ws.room){
                            client.send(JSON.stringify({id:ws.id,type:'CLOSE'}))
                        }
                    }
                })
            
        })
    })
}