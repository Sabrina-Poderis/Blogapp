require('../models/Categoria');
require('../models/Postagem');
const express   = require('express');
const router    = require('express').Router();
const mongoose  = require('mongoose');
const Categoria = mongoose.model('categorias');
const Postagem  = mongoose.model('postagens');
const {eAdmin}  = require('../helpers/eAdmin');

router.get('/', eAdmin, (req, res) => {
    res.render('../views/layouts/admin/index');
});

// -------------- //
router.get('/postagens', eAdmin, (req, res) => {
    Postagem.find().populate('categoria').sort({data:'desc'}).then((postagens) => {
        res.render('../views/layouts/admin/Postagem/postagens', {postagens: postagens.map(postagens => postagens.toJSON())})
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro!' + erro);
        res.redirect('/admin');
    });
});

router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('../views/layouts/admin/Postagem/add-postagens', {categorias: categorias.map(categorias => categorias.toJSON())})
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro!' + erro);
        res.redirect('/admin');
    });
});

router.post('/postagens/nova', eAdmin, (req, res) => {
    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: 'Título inválido'});
    } else if(req.body.titulo.length < 2){
        erros.push({texto: "Título é muito pequeno"});
    }

    if(erros.length > 0){
        res.render('../views/layouts/admin/Postagem/add-postagens', {erros: erros});
    } else {
        const novaPostagem = {
            titulo   : req.body.titulo,
            slug     : req.body.slug,
            descricao: req.body.descricao,
            conteudo : req.body.conteudo,
            categoria: req.body.categoria
        };
    
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem salva com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro!' + erro);
            res.redirect('/admin/postagens');
        });
    }
});

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
    Postagem.findOne({_id:req.params.id}).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render('../views/layouts/admin/Postagem/edit-postagens', {categorias: categorias, postagem: postagem});
        }).catch(() => {
            req.flash('error_msg', 'Erro! Não foi possível listar as categorias');
            res.redirect('/admin/postagens');
        });
    }).catch(() => {
        req.flash('error_msg', 'Erro! Não foi possível editar a postagem porque ela não existe');
        res.redirect('/admin/postagens');
    });
});

router.post('/postagens/edit/', eAdmin, (req, res) => {
    Postagem.findOne({_id:req.body.id}).then((postagem) => {
        postagem.titulo    = req.body.titulo;
        postagem.slug      = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo  = req.body.conteudo;
        postagem.categoria = req.body.categoria;
       
        postagem.save().then(() => {
           req.flash('success_msg', 'Postagem editada com sucesso!');
           res.redirect('/admin/postagens');
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao editar postagem! ' + erro);
            res.redirect('/admin/postagens');
        });
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao editar postagem! ' + erro);
        res.redirect('/admin/postagens');
    });
});

router.post('/postagens/deletar/', eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Postagem excluida com sucesso!');
        res.redirect('/admin/postagens');
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao deletar postagem! ' + erro);
        res.redirect('/admin/postagens');
    });
});
// -------------- //

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({data:'desc'}).then((categorias) => {
        res.render('../views/layouts/admin/Categoria/categorias', {categorias: categorias.map(categorias => categorias.toJSON())})
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro!' + erro);
        res.redirect('/admin');
    });
});

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('../views/layouts/admin/Categoria/add-categorias');
});

router.post('/categorias/nova', eAdmin, (req, res) => {
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
        res.render('../views/layouts/admin/Categoria/add-categorias', {erros: erros});
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

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
        res.render('../views/layouts/admin/Categoria/edit-categorias', {categoria: categoria});
    }).catch(() => {
        req.flash('error_msg', 'Erro! Não foi possível editar a categoria porque ela não existe');
        res.redirect('/admin/categorias');
    })
});

router.post('/categorias/edit/', eAdmin, (req, res) => {
    Categoria.findOne({_id:req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;
       
        categoria.save().then(() => {
           req.flash('success_msg', 'Categoria editada com sucesso!');
           res.redirect('/admin/categorias');
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao editar categoria! ' + erro);
            res.redirect('/admin/categorias');
        });
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao editar categoria! ' + erro);
        res.redirect('/admin/categorias');
    });
});

router.post('/categorias/deletar/', eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria excluida com sucesso!');
        res.redirect('/admin/categorias');
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao deletar categoria! ' + erro);
        res.redirect('/admin/categorias');
    });
});

module.exports = router;