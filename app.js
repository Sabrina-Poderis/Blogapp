// Carregando módulos
    // Express
        const express     = require('express');
        const app         = express();
    // Body Parser
        const bodyParser  = require('body-parser');
    // Handlebars
        const handlebars  = require('express-handlebars')
    // Mongoose
        const mongoose    = require('mongoose');
        const db          = require('./config/db');
    // Rotas
        const path        = require('path');
        const admin       = require('./routes/admin');
        const category    = require('./routes/category')
        const profile     = require('./routes/profile');
        const auth        = require('./routes/auth');
        const post        = require('./routes/post');
    // Sessão
        const session     = require('express-session');
        const passport    = require('passport');
        require('./config/auth')(passport);
        const flash       = require('connect-flash');
    // Controller    
        const postsController      = require('./control/postsController');
        const categoriesController = require('./control/categoriesController');
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
            res.locals.error_msg   = req.flash('error');
            res.locals.user        = req.user || null;
            next();
        });
    // Body Parser
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.json());
    // Handlebars
        app.engine('handlebars', handlebars({
            defaultLayout: 'layouts/main',
            helpers: {
                formatDate: (date) => {
                    return moment(date).format('DD/MM/YYYY hh:mm')
                },
                ifIdEq: (v1, v2, options) => {
                    v1 = v1._id.toString();
                    v2 = v2._id.toString();

                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                }
            },
            layoutsDir:  path.resolve(__dirname, 'views'),
            partialsDir: path.resolve(__dirname, 'views', 'partials')
        }));
        app.set('view engine', 'handlebars');
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI, {
            useNewUrlParser: true , 
            useUnifiedTopology: true
        }).catch((erro)=>{
            console.log("Houve um erro no MongoDB: " + erro);
        });
    //Public
        app.use(express.static('public'));
    // Rotas
        app.get('/', postsController.index);
        app.get('/sobre', categoriesController.getCategories);
        app.use('/postagem', post);
        app.use('/categoria', category);
        app.use('/admin', admin);
        app.use('/perfil', profile);
        app.use('/auth', auth);
    // Outros
        const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log('Servidor ligado! http://localhost:'+PORT+'/');
});