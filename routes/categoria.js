require('../models/Categoria');
require('../models/Postagem');
const express   = require('express');
const router    = require('express').Router();
const mongoose  = require('mongoose');
const Categoria = mongoose.model('categorias');
const Postagem  = mongoose.model('postagens');

router.get('/', (req, res) => {
    Categoria.find().sort({nome: 'asc'}).then((categorias) => {
        res.render('../views/layouts/categorias/index', {categorias: categorias.map(categorias => categorias.toJSON())})
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro!' + erro);
        res.redirect('/');
    });
})

router.get('/:slug', (req, res) => {
    Categoria.findOne({slug:req.params.slug}).lean().then((categoria) => {
        if(categoria){
            Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                res.render('../views/layouts/categorias/postagens', {postagens: postagens, categoria: categoria});
            }).catch((erro) => {
                req.flash('error_msg', 'Erro! Não foi possível listar os posts');
                res.redirect('/');
            })
        } else {
            req.flash('error_msg', 'Erro! Esta categoria não existe');
            res.redirect('/');
        }
    }).catch(() => {
        req.flash('error_msg', 'Erro interno ao carregar esta categoria');
        res.redirect('/');
    })
});

module.exports = router;