const router               = require('express').Router();
const {adminAuthenticated} = require('../helpers/adminAuthenticated');
const ctlCategoria         = require('../control/categoria');
const ctlPostagem          = require('../control/postagem');
const ctlUsuario           = require('../control/usuario');

router.get('/', adminAuthenticated, (req, res) => {
    res.render('../views/layouts/admin/index');
});

// Gerenciamento de Postagens
    router.get('/postagens', adminAuthenticated, ctlPostagem.preencheTabelaPostagem);

    router.get('/postagens/:slug', adminAuthenticated, ctlPostagem.exibePostagemAdmin);

    router.post('/postagens/edit-status/', adminAuthenticated, ctlPostagem.editaStatus);

    router.post('/postagens/deletar/', adminAuthenticated, ctlPostagem.deletaPostagemAdmin);

// Gerenciamento de Categorias
    router.get('/categorias', adminAuthenticated, ctlCategoria.listaCategorias);

    router.get('/categorias/add', adminAuthenticated, (req, res) => {
        res.render('../views/layouts/admin/Categoria/add-categorias');
    });

    router.post('/categorias/nova', adminAuthenticated, ctlCategoria.novaCategoria);

    router.get('/categorias/edit/:id', adminAuthenticated, ctlCategoria.preencheFormularioCategoria);

    router.post('/categorias/edit/', adminAuthenticated, ctlCategoria.editaCategoria);

    router.post('/categorias/deletar/', adminAuthenticated, ctlCategoria.deletaCategoria);

// Gerenciamento de Usuários
    router.get('/usuarios', adminAuthenticated, ctlUsuario.preencheTabelaUsuario);

    router.post('/usuarios/edit_admin/', adminAuthenticated, ctlUsuario.editaStatusUsuario);

    router.post('/usuarios/deletar/', adminAuthenticated, ctlUsuario.deletaUsuarioAdmin); 
    //notifica usuario se fizer login??

module.exports = router;