const express = require('express')
const router = express.Router()
const { uid } = require('uid')
require('dotenv').config()


module.exports = router.get('/home', (req, res) => {
    console.log(req.ip);
    // console.log(req.hostname);
    const path = 'ws://' + req.hostname + ':8080'
    const next = uid(32);
    res.render('home', { isHome: true, next: next, support: true, path: path, ip: req.ip })
})  