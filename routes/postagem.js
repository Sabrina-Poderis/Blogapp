const router    = require('express').Router();
const ctlPostagem  = require('../control/postagem');

router.get('/', ctlPostagem.listaPostagensAprovadasPagina);

router.get('/:slug', ctlPostagem.exibePostagem);

module.exports = router;