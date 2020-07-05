// Carregando módulos
    // Express
        const express    = require('express');
        const app        = express();
    // Body Parser
        const bodyParser = require('body-parser');
    // Handlebars
        const handlebars = require('express-handlebars')
    // Mongoose
        const mongoose   = require('mongoose');
        const db         = require('./config/db');
    // Rotas
        const path       = require('path');
        const admin      = require('./routes/admin');
        const categoria  = require('./routes/categoria')
        const perfil     = require('./routes/perfil');
        const auth       = require('./routes/auth');
        const postagem   = require('./routes/postagem');
    // Sessão
        const session    = require('express-session');
        const passport   = require('passport');
        require('./config/auth')(passport);
        const flash      = require('connect-flash');
    // Control Postagem    
        const ctlPostagem  = require('./control/postagem');
    // Moment
        const moment = require('moment');

// Configurações
    // Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }));
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash());
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg');
            res.locals.error_msg   = req.flash('error_msg');
            res.locals.error       = req.flash('error');
            res.locals.user        = req.user || null;
            next();
        });
    // Body Parser
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.json());
    // Handlebars
        app.engine('handlebars', handlebars({
            defaultLayout: 'main',
            helpers: {
                formatDate: (date) => {
                    return moment(date).format('DD/MM/YYYY hh:mm')
                },
                if_eq: (a, b, opts) => {
                    if (a.toString() == b.toString()) {
                        return opts.fn(this)
                    } else {
                        return opts.inverse(this)
                    }
                }
            }
        }));
        app.set('view engine', 'handlebars');
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI, {
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
        app.get('/', ctlPostagem.listaPostagensAprovadasIndex);
        app.use('/postagem', postagem);
        app.use('/categoria', categoria);
        app.use('/admin', admin);
        app.use('/perfil', perfil);
        app.use('/auth', auth);
    // Outros
        const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log('Servidor ligado! http://localhost:'+PORT+'/');
});