const router               = require('express').Router();
const categoriesController = require('../control/categoriesController');

router.get('/', categoriesController.list)
router.get('/:slug', categoriesController.listCategoryPosts);

module.exports = router;