const express = require("express");
const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('../views/layouts/admin/index');
});

router.get('/posts', (req, res) => {
    res.send('Página de posts');
});

router.get('/categorias', (req, res) => {
    res.render('../views/layouts/admin/categorias');
});

router.get('/categorias/add', (req, res) => {
    res.render('../views/layouts/admin/add-categorias');
});

module.exports = router;