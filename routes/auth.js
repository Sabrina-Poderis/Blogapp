const router  = require("express").Router();
const cltAuth = require('../control/auth');

router.get('/', (req, res) => {
    //carregar pagina login ou registro
});

router.get('/registro', (req, res) => {
    res.render('../views/layouts/auth/registro');
});

router.post('/registro', cltAuth.createAccount);

router.get('/login', (req, res) => {
    res.render('../views/layouts/auth/login');
});

router.post("/login", cltAuth.login);

router.get("/logout", cltAuth.logout);

module.exports = router;