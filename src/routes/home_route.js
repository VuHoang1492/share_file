const express = require('express')
const router = express.Router()
const { uid } = require('uid')
require('dotenv').config()
const port = process.env.PORT

module.exports = router.get('/home', (req, res) => {
    console.log(req.ip);

    const path = req.protocol === 'http' ? ('ws://' + req.hostname + ':' + port) : ('wss://' + req.hostname + ':' + port)
    const next = uid(32);
    res.render('home', { isHome: true, next: next, support: true, path: path, ip: req.ip })
})  