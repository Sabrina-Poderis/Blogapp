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
    Categoria.find().sort({data:'desc'}).then((categorias) => {
        res.render('../views/layouts/admin/categorias', {categorias: categorias.map(categorias => categorias.toJSON())})
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro!' + erro);
        res.redirect('/admin');
    })
});

router.get('/categorias/add', (req, res) => {
    res.render('../views/layouts/admin/add-categorias');
});

router.post('/categorias/nova', (req, res) => {
    var erros = []
    
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido'});
    } else if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno"});
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'});
    }

    if(erros.length > 0){
        res.render('../views/layouts/admin/add-categorias', {erros: erros});
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        };
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria salva com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro!' + erro);
            res.redirect('/admin');
        });
    }

    
});

module.exports = router;