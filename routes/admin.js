const router               = require('express').Router();
const {adminAuthenticated} = require('../helpers/adminAuthenticated');
const categoryControl      = require('../control/category');
const postControl          = require('../control/post');
const userControl          = require('../control/user');

router.get('/', adminAuthenticated, (req, res) => {
    res.render('../views/layouts/admin/index');
});

// Gerenciamento de Postagens
    router.get('/postagens', adminAuthenticated, postControl.fillPostTable);

    router.get('/postagens/:slug', adminAuthenticated, postControl.showPostUnderReview);

    router.post('/postagens/edit-status/', adminAuthenticated, postControl.updateStatus);

    router.post('/postagens/deletar/', adminAuthenticated, postControl.deletePost_Admin);

// Gerenciamento de Categorias
    router.get('/categorias', adminAuthenticated, categoryControl.listCategories);

    router.get('/categorias/add', adminAuthenticated, (req, res) => {
        res.render('../views/layouts/admin/Category/create-category');
    });

    router.post('/categorias/nova', adminAuthenticated, categoryControl.createCategory);

    router.get('/categorias/edit/:id', adminAuthenticated, categoryControl.fillCategoriesForm);

    router.post('/categorias/edit/', adminAuthenticated, categoryControl.updateCategory);

    router.post('/categorias/deletar/', adminAuthenticated, categoryControl.deleteCategory);

// Gerenciamento de Usuários
    router.get('/usuarios', adminAuthenticated, userControl.fillUserTable);

    router.post('/usuarios/edit_admin/', adminAuthenticated, userControl.updateUserStatus);

    router.post('/usuarios/bloqueia-usuario/', adminAuthenticated, userControl.blockUser); 

    router.post('/usuarios/deletar/', adminAuthenticated, userControl.deleteUser); 

module.exports = router;