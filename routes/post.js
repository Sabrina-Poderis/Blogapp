const router       = require('express').Router();
const postControl  = require('../control/post');

router.get('/', postControl.listApprovedPosts_PostsPage);

router.get('/:slug', postControl.showPost);

module.exports = router;