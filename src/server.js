const express = require('express')
const app = express()
const path = require('path')
const http = require('http')
const server = http.createServer(app)
require('dotenv').config()

const port =process.env.PORT

//export config
const bodyParseConfig = require('./configs/bodyParse')
const viewEngineConfig = require('./configs/viewEngineConfig');

//export routes
const homeView = require('./routes/home_route')
const roomView = require('./routes/room_route')
const notSupportView = require('./routes/not_support')
const errorView = require('./routes/error_route')




const socketServer = require('./controls/socket_file_share_server')



//config body-parser
bodyParseConfig(app)

//config view engine
viewEngineConfig(app)

//config static file
app.use(express.static(path.join(__dirname, '/public')))




app.use('/', homeView)
app.use('/', roomView)
app.use('/',notSupportView)
app.use('/',errorView)



socketServer(server)

server.listen(port, () => {
    console.log(`Listen on port ${port}`);
})
