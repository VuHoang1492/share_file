const express = require('express')
const router = express.Router()
const {uid} = require('uid')
require('dotenv').config()
const path =process.env.SERVER_PATH

module.exports = router.get('/home', (req, res) => {
    const next = uid(32);
    res.render('home', { isHome: true,next:next ,support:true,path:path})
})  