const router       = require('express').Router();
const ctlCategoria = require('../control/categoria');

router.get('/', ctlCategoria.exibeCategorias)

router.get('/:slug', ctlCategoria.exibePostsCategoria);

module.exports = router;