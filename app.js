// Carregando módulos
const express       = require('express');
const handlebars    = require('express-handlebars')
const bodyParser    = require('body-parser');
// const mongoose      = require('mongoose');
const app           = express();
const admin         = require('./routes/admin');

// Configurações
    // Body Parser
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.json());
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');
    // Mongoose
        // Em Breve
    // Rotas
        app.get('/', (req, res) => {
            res.send('Rota principal');
        });
        app.use('/admin', admin);
    // Outros
    const PORT = 8081;

app.listen(PORT, () => {
    console.log('Servidor ligado! http://localhost:'+PORT+'/');
});