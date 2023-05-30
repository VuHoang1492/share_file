const express = require('express')
const router = express.Router()
const {uid} = require('uid')
require('dotenv').config()
const path =process.env.SERVER_PATH


module.exports = router.get('/room/:id', (req, res) => {
    const next =uid(32)
    res.render('room', { roomId: req.params.id, isHome: false ,next :next,support:true ,path:path})
})  