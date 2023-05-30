const express = require('express')
const router = express.Router()


module.exports = router.get('/not-support', (req, res) => {
    res.render('not_support', {support:false})
})  