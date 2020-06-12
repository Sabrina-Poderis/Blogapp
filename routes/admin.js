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
        res.redirect('/admin/categorias');
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
            res.redirect('/admin/categorias');
        });
    }
});

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
        res.render('../views/layouts/admin/edit-categorias', {categoria: categoria});
    }).catch(() => {
        req.flash('error_msg', 'Erro! Não foi possível editar a categoria porque ela não existe');
        res.redirect('/admin/categorias');
    })
});

router.post('/categorias/edit/', (req, res) => {
    Categoria.findOne({_id:req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;
       
        categoria.save().then(() => {
           req.flash('success_msg', 'Categoria editada com sucesso!');
           res.redirect('/admin/categorias');
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao salvar categoria! ' + erro);
            res.redirect('/admin/categorias');
        });
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao salvar categoria! ' + erro);
        res.redirect('/admin/categorias');
    });
});

module.exports = router;