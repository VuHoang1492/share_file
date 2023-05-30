const handlebars = require('express-handlebars')
const path = require('path')


module.exports = viewEngineConfig = (app) => {

    const hbs = handlebars.create({
        extname: '.hbs',
    })
    app.engine('hbs', hbs.engine);
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, '../views'));
}