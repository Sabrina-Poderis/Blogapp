const router               = require("express").Router();
const {userAuthenticated}  = require('../helpers/userAuthenticated');
const profilesController   = require('../control/profilesController');

// Editar Perfil
    router.post('/edit', userAuthenticated, profilesController.updateUser);
    router.post('/edit-senha', userAuthenticated, profilesController.updatePassword);
module.exports = router;