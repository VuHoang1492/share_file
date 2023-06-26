const express = require('express')
const router = express.Router()
const { uid } = require('uid')
require('dotenv').config()

const port = process.env.PORT


module.exports = router.get('/room/:id', (req, res) => {
    const path = req.protocol === 'http' ? ('ws://' + req.hostname + ':' + port) : ('wss://' + req.hostname + ':' + port)
    const next = uid(32)
    res.render('room', { roomId: req.params.id, isHome: false, next: next, support: true, path: path })
})  