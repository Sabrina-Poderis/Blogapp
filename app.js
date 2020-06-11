// Carregando módulos
    const express    = require('express');
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser');
    const mongoose   = require('mongoose');
    const app        = express();
    const path       = require('path');
    const admin      = require('./routes/admin');
    const session    = require('express-session');
    const flash      = require('connect-flash');

// Configurações
    // Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }));
        app.use(flash());
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg');
            res.locals.error_msg = req.flash('error_msg');
            next();
        })
    // Body Parser
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.json());
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost/blogapp', {
            useNewUrlParser: true , 
            useUnifiedTopology: true
        }).then(()=>{
            console.log("MongoDB Conectado...");
        }).catch((erro)=>{
            console.log("Houve um erro: " + erro);
        });
    //Public
        app.use(express.static('public'));
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