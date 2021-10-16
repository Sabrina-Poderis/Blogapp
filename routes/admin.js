const router               = require('express').Router();
const {adminAuthenticated} = require('../helpers/adminAuthenticated');
const categoriesController = require('../control/categoriesController');
const postsController      = require('../control/postsController');
const usersController      = require('../control/usersController');

// Gerenciamento de Postagens
    router.get('/postagens', adminAuthenticated, postsController.indexAdmin);

    router.get('/postagens/add', adminAuthenticated, postsController.create);

    router.post('/postagens/nova', postsController.uploadFile, adminAuthenticated, postsController.store);

    router.get('/postagens/edit/:id', adminAuthenticated, postsController.edit);

    router.post('/postagens/edit/', postsController.uploadFile, adminAuthenticated, postsController.update);

    router.post('/postagens/deletar/', adminAuthenticated, postsController.delete);

// Gerenciamento de Categorias
    router.get('/categorias', adminAuthenticated, categoriesController.index);

    router.post('/categorias/nova', adminAuthenticated, categoriesController.store);

    router.post('/categorias/edit/', adminAuthenticated, categoriesController.update);

    router.post('/categorias/deletar/', adminAuthenticated, categoriesController.deleteCategory);

// Gerenciamento de Usuários
    router.get('/usuarios', adminAuthenticated, usersController.index);

    router.get('/usuarios/add', adminAuthenticated, usersController.create);

    router.post('/usuarios/nova', adminAuthenticated, usersController.store);

    router.get('/usuarios/edit/:id', adminAuthenticated, usersController.edit);

    router.post('/usuarios/edit/', adminAuthenticated, usersController.update);

    router.post('/usuarios/bloqueia-usuario/', adminAuthenticated, usersController.blockUser); 

    router.post('/usuarios/deletar/', adminAuthenticated, usersController.delete); 

module.exports = router;