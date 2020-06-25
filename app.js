// Carregando módulos
    require('./models/Categoria');
    require('./models/Postagem');
    require('./models/Usuario');
    
    const express    = require('express');
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser');
    const mongoose   = require('mongoose');
    const app        = express();
    const path       = require('path');
    const admin      = require('./routes/admin');
    const usuario    = require('./routes/usuario');
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
            Postagem.find().populate('categoria').sort({data:'desc'}).then((postagens) => {
                res.render('../views/index', {postagens: postagens.map(postagens => postagens.toJSON())})
            }).catch((erro) => {
                req.flash('error_msg', 'Ocorreu um erro!' + erro);
                res.redirect('/');
            });
        });

        app.get('/postagem/:slug', (req,res) => {
            const slug = req.params.slug
            Postagem.findOne({slug}).then(postagem => {
                if(postagem){
                    const post = {
                        titulo: postagem.titulo,
                        data: postagem.data,
                        conteudo: postagem.conteudo
                    }
                    res.render('../views/layouts/postagem/index', post)
                }else{
                    req.flash("error_msg", "Essa postagem nao existe")
                    res.redirect("/")
                }
            }).catch(err => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/")
            })
        });

        app.get('/categorias', (req, res) => {
            Categoria.find().sort({nome: 'asc'}).then((categorias) => {
                res.render('../views/layouts/categorias/index', {categorias: categorias.map(categorias => categorias.toJSON())})
            }).catch((erro) => {
                req.flash('error_msg', 'Ocorreu um erro!' + erro);
                res.redirect('/admin');
            });
        })

        app.get('/categorias/:slug', (req, res) => {
            Categoria.findOne({slug:req.params.slug}).lean().then((categoria) => {
                if(categoria){
                    Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                        res.render('../views/layouts/categorias/postagens', {postagens: postagens, categoria: categoria});
                        console.log(postagens);
                    }).catch((erro) => {
                        req.flash('error_msg', 'Erro! Não foi possível listar os posts');
                        res.redirect('/');
                    })
                } else {
                    req.flash('error_msg', 'Erro! Esta categoria não existe');
                    res.redirect('/');
                }
            }).catch(() => {
                req.flash('error_msg', 'Erro interno ao carregar esta categoria');
                res.redirect('/');
            })
        });
        
        app.use('/admin', admin);
        app.use('/usuario', usuario);
    // Outros
        const PORT = 8081;

app.listen(PORT, () => {
    console.log('Servidor ligado! http://localhost:'+PORT+'/');
});