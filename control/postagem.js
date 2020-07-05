require('../models/Postagem');
require('../models/Usuario');
require('../models/Categoria');
const mongoose  = require('mongoose');
const Postagem  = mongoose.model('postagens');
const Usuario   = mongoose.model('usuarios');
const Categoria = mongoose.model('categorias');
const {slugFormatter} = require('../helpers/slugFormatter');

//Mostra Postagens
    exports.exibePostagem = function (req, res) {
        Postagem.findOne({slug: req.params.slug}).then(postagem => {
            if(postagem){
                if(postagem.status == "aprovado"){
                    const post = {
                        titulo: postagem.titulo,
                        data: postagem.data,
                        conteudo: postagem.conteudo
                    }
                    res.render('../views/layouts/postagem/exibe-postagem', post)
                } else {
                    req.flash("error_msg", "Essa postagem ainda não foi analisada pelo admin")
                    res.redirect("/")
                }
            }else{
                req.flash("error_msg", "Essa postagem nao existe")
                res.redirect("/")
            }
        }).catch(err => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    };

    exports.listaPostagens = function (req, res) {
        Postagem.find().populate('categoria').sort({data:'desc'}).then((postagens) => {
            res.render('../views/layouts/postagem/postagens', {postagens: postagens.map(postagens => postagens.toJSON())})
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro!' + erro);
            res.redirect('/perfil/');
        });
    }

    exports.listaPostagensAprovadasIndex = function (req, res) {
        Postagem.find({status: 'aprovado'}).populate('categoria').sort({data:'desc'}).then((postagens) => {
            res.render('../views/index', {postagens: postagens.map(postagens => postagens.toJSON())})
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro!' + erro);
            res.redirect('/');
        });
    }

    exports.listaPostagensAprovadasPagina = function (req, res) {
        Postagem.find({status: 'aprovado'}).populate('categoria').sort({data:'desc'}).then((postagens) => {
            res.render('../views/layouts/postagem/index', {postagens: postagens.map(postagens => postagens.toJSON())})
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro!' + erro);
            res.redirect('/');
        });
    }

    exports.listaPostagensUsuario = function (req, res) {
        Postagem.find({usuario: res.locals.user}).populate('categoria').populate('usuario').sort({data:'desc'}).then((postagens) => {
            res.render('../views/layouts/postagem/postagens', {postagens: postagens.map(postagens => postagens.toJSON())})
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro!' + erro);
            res.redirect('/');
        });
    }

//Operações Postagens
    function validaCamposPostagem (dados){
        let errosFormulario = [];

        if(!dados.titulo || typeof dados.titulo == undefined || dados.titulo == null){
            errosFormulario.push({texto: 'Título inválido'});
        } else if(dados.titulo.length < 2){
            errosFormulario.push({texto: "Título é muito pequeno"});
        }
        
        if(!dados.slug || typeof dados.slug == undefined || dados.slug == null){
            errosFormulario.push({texto: 'Slug inválido'});
        } else if(dados.slug.length < 2){
            errosFormulario.push({texto: "Slug é muito pequeno"});
        }
        
        if(!dados.descricao || typeof dados.descricao == undefined || dados.descricao == null){
            errosFormulario.push({texto: 'Descrição inválida'});
        } else if(dados.descricao.length < 2){
            errosFormulario.push({texto: "Descrição é muito pequena"});
        }
        
        if(!dados.conteudo || typeof dados.conteudo == undefined || dados.conteudo == null){
            errosFormulario.push({texto: 'Conteúdo inválido'});
        } else if(dados.conteudo.length < 2){
            errosFormulario.push({texto: "Conteúdo é muito pequeno"});
        }
        
        if(!dados.categoria || typeof dados.categoria == undefined || dados.categoria == null){
            errosFormulario.push({texto: 'Categoria inválida'});
        } 
        
        if(!dados.user_id || typeof dados.user_id == undefined || dados.user_id == null){
            errosFormulario.push({texto: 'Usuário inválido'});
        }

        return errosFormulario;
    }

    exports.criaPostagem = function (req, res) {
        let errosFormulario = validaCamposPostagem(req.body);
        let statusPostagem;

        if(errosFormulario.length > 0){
            res.render('../views/layouts/postagem/add-postagens', {errosFormulario: errosFormulario});
        } else {
            Usuario.findOne({_id:req.body.user_id}).lean().then((usuario) => {
                if(usuario.eAdmin == true){
                    statusPostagem = 'aprovado';
                } else {
                    statusPostagem = 'em análise';
                }
                
                const novaPostagem = {
                    titulo   : req.body.titulo,
                    slug     : slugFormatter(req.body.slug),
                    descricao: req.body.descricao,
                    conteudo : req.body.conteudo,
                    categoria: req.body.categoria,
                    usuario  : req.body.user_id,
                    status   : statusPostagem
                };
                    
                new Postagem(novaPostagem).save().then(() => {
                    req.flash('success_msg', 'Postagem salva com sucesso!');
                    res.redirect('/perfil/minhas-postagens');
                }).catch((erro) => {
                    req.flash('error_msg', 'Ocorreu um erro!' + erro);
                    res.redirect('/perfil/minhas-postagens');
                }); 
            }).catch((erro) => {
                req.flash('error_msg', 'Erro!' + erro);
                res.redirect('/perfil/minhas-postagens');
            });
        }
    }

    exports.preencheFormularioPostagem = function (req, res) {
        Postagem.findOne({_id:req.params.id}).lean().populate('categoria').then((postagem) => {
            Categoria.find().lean().then((categorias) => {
                res.render('../views/layouts/postagem/edit-postagens', {categorias: categorias, postagem: postagem});
            }).catch(() => {
                req.flash('error_msg', 'Erro! Não foi possível listar as categorias');
                res.redirect('/perfil/minhas-postagens');
            });
        }).catch(() => {
            req.flash('error_msg', 'Erro! Não foi possível editar a postagem porque ela não existe');
            res.redirect('/perfil/minhas-postagens');
        });
    }

    exports.editaPostagem = function (req, res) {
        Postagem.findOne({_id:req.body.post_id}).then((postagem) => {
            let errosFormulario = validaCamposPostagem(req.body);
            
            if(errosFormulario.length > 0){
                req.flash('error_msg', 'Erro ao editar postagem! Existiam campos em branco!');
                res.redirect('/perfil/minhas-postagens/edit/' + req.body.post_id);
            } else {
                Usuario.findOne({_id:req.body.user_id}).then((usuario) => {
                    if(usuario.eAdmin == true){
                        statusPostagem = 'aprovado';
                    } else {
                        statusPostagem = 'em análise';
                    }

                    postagem.titulo    = req.body.titulo;
                    postagem.slug      = slugFormatter(req.body.slug);
                    postagem.descricao = req.body.descricao;
                    postagem.conteudo  = req.body.conteudo;
                    postagem.categoria = req.body.categoria;
                    postagem.status    = statusPostagem;

                    postagem.save().then(() => {
                        req.flash('success_msg', 'Postagem editada com sucesso!');
                        res.redirect('/perfil/minhas-postagens');
                    }).catch((erro) => {
                        req.flash('error_msg', 'Erro ao editar postagem! ' + erro);
                        res.redirect('/perfil/minhas-postagens');
                    });
                }).catch((erro) => {
                    req.flash('error_msg', 'Erro! ' + erro);
                    res.redirect('/perfil/minhas-postagens');
                });
            }
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao editar postagem! ' + erro);
            res.redirect('/perfil/minhas-postagens');
        });
    }

    exports.deletaPostagem = function (req, res) { 
        Postagem.deleteOne({_id: req.body.id}).then(() => {
            req.flash('success_msg', 'Postagem excluida com sucesso!');
            res.redirect('/perfil/minhas-postagens');
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao deletar postagem! ' + erro);
            res.redirect('/perfil/minhas-postagens');
        });
    }

//Gerenciamento de Postagens
    exports.preencheTabelaPostagem = function  (req, res) {
        Postagem.find().sort({nome:'desc'}).populate('categoria').populate('usuario').lean().then((postagens) => {
            res.render('../views/layouts/admin/Postagem/index', {postagens: postagens})
        }).catch((erro) => {
            req.flash('error_msg', 'Ocorreu um erro!' + erro);
            res.redirect('/admin');
        });
    }

    exports.exibePostagemAdmin = function (req, res) {
        Postagem.findOne({slug: req.params.slug}).then(postagem => {
            if(postagem){
                const post = {
                    titulo: postagem.titulo,
                    data: postagem.data,
                    conteudo: postagem.conteudo,
                    id: postagem._id
                }
                res.render('../views/layouts/admin/postagem/analise-postagens', post)
            }else{
                req.flash("error_msg", "Essa postagem nao existe")
                res.redirect("/")
            }
        }).catch(err => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    };

    exports.editaStatus = function (req, res){
        Postagem.findOne({_id:req.body.id}).then((postagem) => {
            postagem.status = req.body.resultado_analise;
            postagem.save().then(() => {
            req.flash('success_msg', 'Usuário editado com sucesso!');
            res.redirect('/admin/postagens');
            }).catch((erro) => {
                req.flash('error_msg', 'Erro ao editar usuario! ' + erro);
                res.redirect('/admin/postagens');
            });
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao editar postagem! ' + erro);
            res.redirect('/admin/postagens');
        });
    }

    exports.deletaPostagemAdmin = function (req, res) { 
        Postagem.deleteOne({_id: req.body.id}).then(() => {
            req.flash('success_msg', 'Postagem excluida com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao deletar postagem! ' + erro);
            res.redirect('/admin/postagens');
        });
    }