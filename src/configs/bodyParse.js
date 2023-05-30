var bodyParser = require('body-parser')

module.exports = bodyParseConfig = (app) => {
    app.use(bodyParser.json())
}