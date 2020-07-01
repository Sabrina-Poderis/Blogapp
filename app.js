// Carregando módulos
    require('./models/Categoria');
    require('./models/Postagem');
    require('./models/Usuario');
    
    const express    = require('express');
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser');
    const mongoose   = require('mongoose');
    const db         = require('./config/db');
    const app        = express();
    const path       = require('path');
    const admin      = require('./routes/admin');
    const categoria  = require('./routes/categoria')
    const usuario    = require('./routes/usuario');
    const postagem   = require('./routes/postagem');
    const session    = require('express-session');
    const flash      = require('connect-flash');
    const Categoria  = mongoose.model('categorias');
    const Postagem   = mongoose.model('postagens');
    const Usuario    = mongoose.model('usuarios');
    const passport   = require('passport');
    require('./config/auth')(passport);
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
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
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
        app.get('/', (req, res) => {
            Postagem.find({status: 'aprovado'}).populate('categoria').sort({data:'desc'}).then((postagens) => {
                res.render('../views/index', {postagens: postagens.map(postagens => postagens.toJSON())})
            }).catch((erro) => {
                req.flash('error_msg', 'Ocorreu um erro!' + erro);
                res.redirect('/');
            });
        });
   
        app.use('/postagem', postagem);
        app.use('/categoria', categoria);
        app.use('/admin', admin);
        app.use('/usuario', usuario);
    // Outros
        const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log('Servidor ligado! http://localhost:'+PORT+'/');
});