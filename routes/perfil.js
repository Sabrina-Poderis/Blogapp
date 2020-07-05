const router              = require("express").Router();
const {userAuthenticated} = require('../helpers/userAuthenticated');
const ctlPerfil           = require('../control/perfil');
const ctlPostagem         = require('../control/postagem');
const ctlCategoria        = require('../control/categoria')

router.get('/', userAuthenticated, (req, res) => {
    res.render('../views/layouts/perfil/index');
});

// Editar Perfil
    router.get('/edit/:id', userAuthenticated, ctlPerfil.carregaDadosUsuario);

    router.post('/edit', userAuthenticated, ctlPerfil.editUsuario);

    router.get('/edit-senha', userAuthenticated, (req, res) => {
        res.render('../views/layouts/perfil/edit-senha');
    });

    router.post('/edit-senha', userAuthenticated, ctlPerfil.editSenha);

    router.post('/deletar/', userAuthenticated, ctlPerfil.deletaUsuario);

    router.get('/transferir-dono/', userAuthenticated, ctlPerfil.transfereDono);

    router.get('/transferir-dono/:id', userAuthenticated, ctlPerfil.transfereDonoDois);

// Postagens
    router.get('/minhas-postagens', userAuthenticated, ctlPostagem.listaPostagensUsuario);

    router.get('/minhas-postagens/add', userAuthenticated, ctlCategoria.listaCategoriasCombo);

    router.post('/minhas-postagens/nova', userAuthenticated, ctlPostagem.criaPostagem);

    router.get('/minhas-postagens/edit/:id', userAuthenticated, ctlPostagem.preencheFormularioPostagem);

    router.post('/minhas-postagens/edit/', userAuthenticated, ctlPostagem.editaPostagem);

    router.post('/minhas-postagens/deletar/', userAuthenticated, ctlPostagem.deletaPostagem);

module.exports = router;