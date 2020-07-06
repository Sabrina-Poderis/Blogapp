const router          = require('express').Router();
const controlCategory = require('../control/category');

router.get('/', controlCategory.showCategories)

router.get('/:slug', controlCategory.showCategoryPosts);

module.exports = router;