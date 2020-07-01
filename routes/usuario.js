require("../models/Usuario");
require('../models/Categoria');
require('../models/Postagem');
const express             = require("express");
const router              = express.Router();
const mongoose            = require("mongoose");
const bcrypt              = require("bcryptjs");
const passport            = require("passport");
const Usuario             = mongoose.model("usuarios");
const Categoria           = mongoose.model('categorias');
const Postagem            = mongoose.model('postagens');
const {userAuthenticated} = require('../helpers/userAuthenticated');

router.get('/', userAuthenticated, (req, res) => {
    res.render('../views/layouts/usuario/index');
});

router.get('/registro', (req, res) => {
    res.render('../views/layouts/usuario/registro');
});

router.post('/registro', (req, res, next) => {
    var erros = []

    if(erros.length > 0){
        res.render('../views/layouts/usuario/registro', {erros: erros});
    } else {
       Usuario.findOne({email:  req.body.email}).then((usuario) => {
        if (usuario) {
            req.flash('error_msg', 'Esse email ja possui um cadastro no sistema!');
            res.redirect('/usuarios/registro');
        } else {
            const novoUsuario = new Usuario({
                nome        : req.body.nome,
                sobrenome   : req.body.sobrenome,
                nome_usuario: req.body.nome_usuario,
                email       : req.body.email,
                senha       : req.body.senha,
                eAdmin      : false
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(novoUsuario.senha, salt, (err, hash) => {
                    if (err) {
                        req.flash('error_msg', 'Houve um erro durante o salvamento do usuário');
                        res.redirect('/');
                    } else {
                        novoUsuario.senha = hash;
                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuário cadastrado com sucesso!');
                            passport.authenticate("local", {
                                successRedirect: "/",
                                failureRedirect: "/usuario/login",
                                failureFlash: true
                            })(req, res, next);
                        }).catch((erro) => {
                            req.flash('error_msg', 'Houve um erro na criação do usuário' + erro);
                            res.redirect('/usuario/registro');
                        });
                    }
                });
            });
        }
       }).catch((erro) => {
           req.flash('error_msg', 'Houve um erro interno');
           res.redirect('/');
       })
    }
});

router.get('/login', (req, res) => {
    res.render('../views/layouts/usuario/login');
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuario/login",
        failureFlash: true
    })(req, res, next);
});

router.get("/logout", (req, res) => {
    req.logout();
    req.flash('success_msg', "Deslogando com sucesso!");
    res.redirect("/");
});

router.get('/edit/:id', userAuthenticated, (req, res) => {
    Usuario.findOne({_id:req.params.id}).lean().then((usuario) => {
        res.render('../views/layouts/usuario/edit-registro', {usuario: usuario});
    }).catch(() => {
        req.flash('error_msg', 'Erro! Não foi possível editar o usuario');
        res.redirect('/usuario');
    })
});

router.post('/edit', userAuthenticated, (req, res) => {
    Usuario.findOne({_id:req.body.id}).then((usuario) => {
        usuario.nome         = req.body.nome;
        usuario.sobrenome    = req.body.sobrenome;
        usuario.nome_usuario = req.body.nome_usuario;
        usuario.email        = req.body.email;
       
        usuario.save().then(() => {
           req.flash('success_msg', 'Usuario editada com sucesso!');
           res.redirect('/usuario');
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao editar usuario! ' + erro);
            res.redirect('/usuario');
        });
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao editar usuario! ' + erro);
        res.redirect('/usuario');
    });
});

router.get('/edit-senha', userAuthenticated, (req, res) => {
    res.render('../views/layouts/usuario/edit-senha');
});

router.post('/edit-senha', userAuthenticated, (req, res) => {
    Usuario.findOne({_id:req.body.id}).then((usuario) => {
        var erros = [];

        if(!req.body.senha_nova || typeof req.body.senha_nova == undefined || req.body.senha_nova == null){
            erros.push({texto: 'senhanova inválido'});
        }

        if(!req.body.senha_confirmada || typeof req.body.senha_confirmada == undefined || req.body.senha_confirmada == null){
            erros.push({texto: 'senha_confirmada inválido'});
        }

        if(req.body.senha_nova != req.body.senha_confirmada){
            erros.push({texto: 'senhas diferentes'});
        }

        if(erros.length > 0){
            res.render('../views/layouts/usuario/edit-senha', {erros: erros});
        } else {
            usuario.senha  = req.body.senha_nova;
        
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(usuario.senha, salt, (err, hash) => {
                    if (err) {
                        req.flash('error_msg', 'Houve um erro durante o salvamento do usuário');
                        res.redirect('/usuario');
                    } else {
                        usuario.senha = hash;
                        usuario.save().then(() => {
                            req.flash('success_msg', 'Senha mudada com sucesso!');
                            res.redirect('/usuario');
                        }).catch((erro) => {
                            req.flash('error_msg', 'Houve um erro' + erro);
                            res.redirect('/usuario/');
                        });
                    }
                });
            });
        }
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao editar Senha! ' + erro);
        res.redirect('/usuario');
    });
});

router.get('/postagens', userAuthenticated, (req, res) => {
    Postagem.find({usuario: res.locals.user}).populate('categoria').populate('usuario').sort({data:'desc'}).then((postagens) => {
        res.render('../views/layouts/usuario/postagem/postagens', {postagens: postagens.map(postagens => postagens.toJSON())})
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro!' + erro);
        res.redirect('/');
    });
});

router.get('/postagens/add', userAuthenticated, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('../views/layouts/usuario/postagem/add-postagens', {categorias: categorias.map(categorias => categorias.toJSON())})
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro!' + erro);
        res.redirect('/');
    });
});

router.post('/postagens/nova', userAuthenticated, (req, res) => {
    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: 'Título inválido'});
    } else if(req.body.titulo.length < 2){
        erros.push({texto: "Título é muito pequeno"});
    }

    if(erros.length > 0){
        res.render('../views/layouts/usuario/postagem/add-postagens', {erros: erros});
    } else {
        Usuario.findOne({_id:req.body.user_id}).lean().then((usuario) => {
           if(usuario.eAdmin == true){
            statusPostagem = 'aprovado';
           } else {
            statusPostagem = 'em análise';
           }

           const novaPostagem = {
               titulo   : req.body.titulo,
               slug     : req.body.slug,
               descricao: req.body.descricao,
               conteudo : req.body.conteudo,
               categoria: req.body.categoria,
               usuario  : req.body.user_id,
               status   : statusPostagem
           };
           
           console.log(statusPostagem);
           new Postagem(novaPostagem).save().then(() => {
               req.flash('success_msg', 'Postagem salva com sucesso!');
               res.redirect('/');
           }).catch((erro) => {
               req.flash('error_msg', 'Ocorreu um erro!' + erro);
               res.redirect('/');
           });
        }).catch((erro) => {
            req.flash('error_msg', 'Erro!' + erro);
            res.redirect('/');
        });

    }
});

router.get('/postagens/edit/:id', userAuthenticated, (req, res) => {
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

router.post('/postagens/edit/', userAuthenticated, (req, res) => {
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

router.post('/postagens/deletar/', userAuthenticated, (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Postagem excluida com sucesso!');
        res.redirect('/admin/postagens');
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao deletar postagem! ' + erro);
        res.redirect('/admin/postagens');
    });
});

module.exports = router;