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
    
                //nếu client đến trong local
    
    
                if(mes.type === 'REQUEST_SEND')
                {
                    wss.clients.forEach(client =>{
                        if(client.id === mes.id){
                            client.send(JSON.stringify({ id : ws.id, type : mes.type}))
                        }
                    })
                }
                if(mes.type ==='ACCEPT' || mes.type === 'DECLINE'){
                    wss.clients.forEach(client =>{
                        if(client.id === mes.id){
                           if(mes.type === 'DECLINE'){
                            client.send(JSON.stringify({ id : ws.id, type : mes.type}))
                           }
                           if(mes.type === 'ACCEPT'){
                            client.send(JSON.stringify({ id : ws.id, type : mes.type}))
                           }
                        }
                    })
                }
                if(mes.type ==='SEND_FILE'){
                    wss.clients.forEach(client=>{
                        if(client.id === mes.receiver_id){
                            client.send(JSON.stringify(mes))
                        }
                    })
                }
            });
    
    
            ws.on("close", () => {
                      let index
                    userList.forEach(user=>{
                         index = userList.findIndex(user=> user.id===ws.id)
                    })
                    userList.splice(index,1)
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