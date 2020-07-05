require('../models/Categoria');
require('../models/Postagem');
const mongoose  = require('mongoose');
const Categoria = mongoose.model('categorias');
const Postagem  = mongoose.model('postagens');
const {slugFormatter} = require('../helpers/slugFormatter');

exports.exibeCategorias = function(req, res) {
    Categoria.find().sort({nome: 'asc'}).then((categorias) => {
        res.render('../views/layouts/categorias/index', {categorias: categorias.map(categorias => categorias.toJSON())})
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro!' + erro);
        res.redirect('/');
    });
}

exports.exibePostsCategoria = function(req, res) {
    Categoria.findOne({slug:req.params.slug}).lean().then((categoria) => {
        if(categoria){
            Postagem.find({categoria: categoria._id, status: 'aprovado'}).lean().then((postagens) => {
                res.render('../views/layouts/categorias/postagens', {postagens: postagens, categoria: categoria});
            }).catch((erro) => {
                req.flash('error_msg', 'Erro! Não foi possível listar os posts');
                res.redirect('/');
            })
        } else {
            req.flash('error_msg', 'Erro! Esta categoria não existe ' + categoria);
            res.redirect('/');
        }
    }).catch(() => {
        req.flash('error_msg', 'Erro interno ao carregar esta categoria');
        res.redirect('/');
    })
}

exports.listaCategoriasCombo = function (req, res) {
    Categoria.find().then((categorias) => {
        res.render('../views/layouts/postagem/add-postagens', {categorias: categorias.map(categorias => categorias.toJSON())})
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro!' + erro);
        res.redirect('/');
    });
}

 // Gerenciamento de Categorias
    function validaCamposCategoria (dados){
        let errosFormulario = [];

        if(!dados.nome || typeof dados.nome == undefined || dados.nome == null){
            errosFormulario.push({texto: 'Nome inválido'});
        } else if(dados.nome.length < 2){
            errosFormulario.push({texto: "Nome da categoria é muito pequena"});
        }

        return errosFormulario;
    }

    exports.listaCategorias = function (req, res){
        Categoria.find().sort({data:'desc'}).then((categorias) => {
            res.render('../views/layouts/admin/categoria/categorias', {categorias: categorias.map(categorias => categorias.toJSON())})
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro!' + erro);
            res.redirect('/admin');
        });
    }

    exports.novaCategoria = function (req, res){
        let errosFormulario = validaCamposCategoria(req.body);

        if(errosFormulario.length > 0){
            res.render('../views/layouts/admin/categoria/add-categorias', {errosFormulario: errosFormulario});
        } else {
            const novaCategoria = {
                nome: req.body.nome,
                slug: slugFormatter(req.body.nome)
            };
        
            new Categoria(novaCategoria).save().then(() => {
                req.flash('success_msg', 'Categoria salva com sucesso!');
                res.redirect('/admin/categorias');
            }).catch((erro) => {
                req.flash('error_msg', 'Ocorreu um erro!' + erro);
                res.redirect('/admin/categorias');
            });
        }
    }

    exports.preencheFormularioCategoria = function (req, res){
        Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
            res.render('../views/layouts/admin/categoria/edit-categorias', {categoria: categoria});
        }).catch(() => {
            req.flash('error_msg', 'Erro! Não foi possível editar a categoria porque ela não existe');
            res.redirect('/admin/categorias');
        })
    }

    exports.editaCategoria = function (req, res){
        Categoria.findOne({_id:req.body.id}).then((categoria) => {
            let errosFormulario = validaCamposCategoria(req.body);
    
            if(errosFormulario.length > 0){
                req.flash('error_msg', 'Erro ao editar categoria! Existiam campos em branco!');
                res.redirect('/admin/categorias/edit/' + req.body.id);
            } else {
                categoria.nome = req.body.nome;
                categoria.slug = slugFormatter(req.body.nome);

                categoria.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso!');
                res.redirect('/admin/categorias');
                }).catch((erro) => {
                    req.flash('error_msg', 'Erro ao editar categoria! ' + erro);
                    res.redirect('/admin/categorias');
                });
            }
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao editar categoria! ' + erro);
            res.redirect('/admin/categorias');
        });
    }

    exports.deletaCategoria = function (req, res){
        Categoria.deleteOne({_id: req.body.id}).then(() => {
            req.flash('success_msg', 'Categoria excluida com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao deletar categoria! ' + erro);
            res.redirect('/admin/categorias');
        });
    }