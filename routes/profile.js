const router              = require("express").Router();
const {userAuthenticated} = require('../helpers/userAuthenticated');
const profileControl      = require('../control/profile');
const postControl         = require('../control/post');
const CategoryControl     = require('../control/category')

router.get('/', userAuthenticated, (req, res) => {
    res.render('../views/layouts/profile/index');
});

// Editar Perfil
    router.get('/edit/:id', userAuthenticated, profileControl.fillUserForm);

    router.post('/edit', userAuthenticated, profileControl.updateUser);

    router.get('/edit-senha', userAuthenticated, (req, res) => {
        res.render('../views/layouts/profile/update-password');
    });

    router.post('/edit-senha', userAuthenticated, profileControl.updatePassword);

    router.post('/deletar/', userAuthenticated, profileControl.deleteUser);

    router.get('/transferir-dono/', userAuthenticated, profileControl.listAdminUsers);

    router.get('/transferir-dono/:id', userAuthenticated, profileControl.transfersOwnership);

// Postagens
    router.get('/minhas-postagens', userAuthenticated, postControl.listUserPosts);

    router.get('/minhas-postagens/add', userAuthenticated, CategoryControl.fillCategoriesComboBox);

    router.post('/minhas-postagens/nova', userAuthenticated, postControl.createPost);

    router.get('/minhas-postagens/edit/:id', userAuthenticated, postControl.fillPostForm);

    router.post('/minhas-postagens/edit/', userAuthenticated, postControl.updatePost);

    router.post('/minhas-postagens/deletar/', userAuthenticated, postControl.deletePost);

module.exports = router;