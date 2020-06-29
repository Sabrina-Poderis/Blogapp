require("../models/Usuario");
const express             = require("express");
const router              = express.Router();
const mongoose            = require("mongoose");
const bcrypt              = require("bcryptjs");
const passport            = require("passport");
const Usuario             = mongoose.model("usuarios");
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

module.exports = router;