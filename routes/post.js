const router          = require('express').Router();
const postsController = require('../control/postsController');

router.get('/', postsController.list);
router.get('/:slug', postsController.show);

module.exports = router;