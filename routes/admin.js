require('../models/Categoria');

const express   = require('express');
const router    = require('express').Router();
const mongoose  = require('mongoose');
const Categoria = mongoose.model('categorias');

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

router.post('/categorias/nova', (req, res) => {
    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    };

    new Categoria(novaCategoria).save().then(() => {
        console.log('Categoria salva com sucesso!');
    }).catch((erro) => {
        console.log('Erro ao salvar categoria!' + erro);
    });
});

module.exports = router;