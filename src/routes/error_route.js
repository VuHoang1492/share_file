const express = require('express')
const router = express.Router()
const {uid} = require('uid')



module.exports = router.get('/error', (req, res) => {
    res.render('error' ,{support:false})
})  