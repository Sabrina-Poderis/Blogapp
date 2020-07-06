const router      = require("express").Router();
const authControl = require('../control/auth');

router.get('/', (req, res) => {
    //carregar pagina login ou registro
});

router.get('/registro', (req, res) => {
    res.render('../views/layouts/auth/registry');
});

router.post('/registro', authControl.createAccount);

router.get('/login', (req, res) => {
    res.render('../views/layouts/auth/login');
});

router.post("/login", authControl.login);

router.get("/logout", authControl.logout);

module.exports = router;