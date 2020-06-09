// Carregando módulos
const express       = require('express');
const handlebars    = require('express-handlebars')
const bodyParser    = require('body-parser');
// const mongoose      = require('mongoose');
const app           = express();

// Configurações
// Body Parser
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
// Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');
// Mongoose
    // Em breve
// Rotas
    app.get('/', (req, res) => {
        res.send('Rota principal');
    });
// Outros
const PORT = 8081;
app.listen(PORT, () => {
    console.log('Servidor ligado! http://localhost:'+PORT+'/');
});