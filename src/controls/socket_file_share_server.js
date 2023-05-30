const WebSocket = require('ws')
const { AvatarGenerator } = require('random-avatar-generator')
const random = require('random-name')
const {uid} = require('uid')

require('dotenv').config()

const path =process.env.SOCKET_SERVER

module.exports = socketServer = (server) => {
    const wss = new WebSocket.Server({ server: server, path:path })
    const generator = new AvatarGenerator()


    wss.on("connection", (ws, req) => {
       

        ws.on('message', (data) => {
            console.log(data);
        });


        ws.on("close", () => {
            wss.clients.forEach(client => {
                if (client != ws) {
                    if (client._socket.remoteAddress === ws._socket.remoteAddress) {
                        client.send(JSON.stringify({ ...user, type: 'GUEST', status: 'DISCONNECTED' }))
                    }
                }

            });
        })
    })
}