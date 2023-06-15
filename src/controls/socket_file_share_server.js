const WebSocket = require('ws')
const { AvatarGenerator } = require('random-avatar-generator')
const random = require('random-name')
const { uid } = require('uid')

const roomService = require('../services/room_service')




require('dotenv').config()

const path = process.env.SOCKET_SERVER

module.exports = socketServer = (server) => {


    const wss = new WebSocket.Server({ server: server, path: path })
    const generator = new AvatarGenerator()


    wss.on("connection", (ws, req) => {
        ws.on('message', async (data) => {

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
                await roomService.addUserRoom({ ...user })



                ws.send(JSON.stringify({ ...user, type: 'ATHU' }))
                const listUser = await roomService.getUserInRoom(ws.room)
                listUser.forEach(user => {
                    if (user.id != ws.id) ws.send(JSON.stringify({ ...user, type: 'GUEST' }))
                })
                wss.clients.forEach(client => {
                    if (client != ws) {
                        if (client.room == ws.room) {
                            client.send(JSON.stringify({ ...user, type: 'GUEST' }))
                        }
                    }
                })
            }

            //nếu client đến trong local


            if (mes.type === 'REQUEST_SEND') {
                wss.clients.forEach(client => {
                    if (client.id === mes.id) {
                        client.send(JSON.stringify({ id: ws.id, type: mes.type, offer: mes.offer }))
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

                            client.send(JSON.stringify({ id: ws.id, type: mes.type, answer: mes.answer }))
                        }
                    }
                })
            }

            if (mes.type === 'CANDIDATE') {
                wss.clients.forEach(client => {
                    if (client.id === mes.id) {
                        client.send(JSON.stringify({ id: ws.id, type: mes.type, candidate: mes.candidate }))
                    }
                })
            }


        });


        ws.on("close", async () => {
            roomService.deleteUserRoom(ws.id).then(() => {
                wss.clients.forEach(client => {
                    if (client.id != ws.id) {
                        if (client.room === ws.room) {
                            client.send(JSON.stringify({ id: ws.id, type: 'CLOSE' }))
                        }
                    }
                })
            })
        })
    })


}