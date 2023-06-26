const WebSocket = require('ws')
const { AvatarGenerator } = require('random-avatar-generator')
const random = require('random-name')
const { uid } = require('uid')
const roomService = require('../services/room_services')

require('dotenv').config()


module.exports = socketServer = (server) => {


    const wss = new WebSocket.Server({ server: server })
    const generator = new AvatarGenerator()

    wss.on("connection", (ws, req) => {
        console.log(ws._socket.remoteAddress);
        ws.on('message', (data) => {

            const mes = JSON.parse(data.toString())

            //Nếu client đến là người tạo room
            if (mes.type === 'ROOM') {
                ws.id = uid()
                ws.room = mes.id
                const user = {
                    name: random(),
                    avatar: generator.generateRandomAvatar(),
                    id: ws.id,
                    room: ws.room
                }
                ws.send(JSON.stringify({ ...user, type: 'ATHU' }))
                roomService.addUserInRoom({ ...user, socket: ws })
                const listUser = roomService.getRoom(user.room)
                // console.log(listUser);
                listUser.forEach(userInRoom => {
                    if (userInRoom.id !== ws.id) {
                        ws.send(JSON.stringify({ ...userInRoom, type: 'GUEST', socket: null }))
                        userInRoom.socket.send(JSON.stringify({ ...user, type: 'GUEST' }))
                    }
                })

            }

            //nếu client đến trong local lấy địa chỉ ip làm room
            if (mes.type === 'HOME') {
                ws.id = uid()
                ws.room = ws._socket.remoteAddress
                const user = {
                    name: random(),
                    avatar: generator.generateRandomAvatar(),
                    id: ws.id,
                    room: ws.room
                }
                ws.send(JSON.stringify({ ...user, type: 'ATHU' }))
                roomService.addUserInRoom({ ...user, socket: ws })
                const listUser = roomService.getRoom(user.room)
                //  console.log(listUser);
                listUser.forEach(userInRoom => {
                    if (userInRoom.id !== ws.id) {
                        ws.send(JSON.stringify({ ...userInRoom, type: 'GUEST', socket: null }))
                        userInRoom.socket.send(JSON.stringify({ ...user, type: 'GUEST' }))
                    }
                })
            }

            if (mes.type === 'REQUEST_SEND') {
                wss.clients.forEach(client => {
                    if (client.id === mes.id) {
                        client.send(JSON.stringify({ id: ws.id, type: mes.type }))
                    }
                })
            }
            if (mes.type === 'ACCEPT' || mes.type === 'DECLINE') {
                wss.clients.forEach(client => {
                    if (client.id === mes.id) {
                        if (mes.type === 'DECLINE') {
                            client.send(JSON.stringify({ id: ws.id, type: mes.type }))
                        }
                        if (mes.type === 'ACCEPT') {

                            client.send(JSON.stringify({ id: ws.id, type: mes.type, peer_id: mes.peer_id }))
                        }
                    }
                })
            }
        });


        ws.on("close", () => {
            if (ws.room) {
                roomService.deleteUserInRoom(ws.room, ws.id)
                const listUser = roomService.getRoom(ws.room)
                if (listUser)
                    listUser.forEach(userInRoom => {
                        userInRoom.socket.send(JSON.stringify({ id: ws.id, type: 'CLOSE' }))

                    })
            }
        })
    })


}
