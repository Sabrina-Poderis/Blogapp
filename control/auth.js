require("../models/Usuario");
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const passport = require("passport");
const Usuario  = mongoose.model("usuarios");

function validaCamposRegistro (dados){
    let errosFormulario = [];

    if(!dados.nome || typeof dados.nome == undefined || dados.nome == null || dados.nome.length < 2){
        errosFormulario.push({texto: "Nome inválido"})
    }

    if(!dados.sobrenome || typeof dados.sobrenome == undefined || dados.sobrenome == null || dados.sobrenome.length < 2){
        errosFormulario.push({texto: "Sobrenome inválido"})
    }

    if(!dados.nome_usuario || typeof dados.nome_usuario == undefined || dados.nome_usuario == null || dados.nome_usuario.length < 2){
        errosFormulario.push({texto: "Nome de usuário inválido"})
    }

    if(!dados.email || typeof dados.email == undefined || dados.email == null || dados.email.length < 2){
        errosFormulario.push({texto: "E-mail inválido"})
    }

    if(!dados.senha || typeof dados.senha == undefined || dados.senha == null){
        errosFormulario.push({texto: "Senha inválida"})
    } else if(dados.senha.length < 5){
        errosFormulario.push({texto: "Sua senha deverá ter no mínimo 5 caracteres"})
    } 
    
    if(!dados.confirmacao_senha || typeof dados.confirmacao_senha == undefined || dados.confirmacao_senha == null){
        errosFormulario.push({texto: "Confirme sua senha"})
    } else if(dados.senha != dados.confirmacao_senha){
        errosFormulario.push({texto: "As senhas estão diferentes"})
    }

    return errosFormulario;
}

function validaCamposLogin (dados){
    let errosFormulario = [];

    if(!dados.email || typeof dados.email == undefined || dados.email == null || dados.email.length < 2){
        errosFormulario.push({texto: "E-mail inválido"})
    }

    if(!dados.senha || typeof dados.senha == undefined || dados.senha == null || dados.senha.length < 3){
        errosFormulario.push({texto: "Senha inválida"})
    } 

    return errosFormulario;
}

exports.createAccount = function (req, res, next) {
    let errosFormulario = validaCamposRegistro(req.body);

    if(errosFormulario.length > 0){
        res.render('../views/layouts/auth/registro', {errosFormulario: errosFormulario});
    } else {
        Usuario.findOne().lean().then((encontraUser) => {
            if(encontraUser){
                varAdmin = false;
                varDono = false;
            } else {
                varAdmin = true;
                varDono = true;
            }
            Usuario.findOne({email:  req.body.email}).lean().then((encontraEmail) => {
                if (encontraEmail) {
                    req.flash('error_msg', 'Esse email ja possui um cadastro no sistema!');
                    res.redirect('/auth/registro');
                } else {
                    Usuario.findOne({nome_usuario:  req.body.nome_usuario}).lean().then((encontraNomeUsuario) => {
                        if (encontraNomeUsuario) {
                            req.flash('error_msg', 'Já existe um usuário com esse nome cadastrado no sistema!');
                            res.redirect('/auth/registro');
                        } else {
                            const novoUsuario = new Usuario({
                                nome        : req.body.nome,
                                sobrenome   : req.body.sobrenome,
                                nome_usuario: req.body.nome_usuario,
                                email       : req.body.email,
                                senha       : req.body.senha,
                                eAdmin      : varAdmin,
                                eDono       : varDono
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
                                                failureRedirect: "/auth/login",
                                                failureFlash: true
                                            })(req, res, next);
                                        }).catch((erro) => {
                                            req.flash('error_msg', 'Houve um erro na criação do usuário' + erro);
                                            res.redirect('/auth/registro');
                                        });
                                    }
                                });
                            });
                        }
                    }).catch(() => {
                        req.flash('error_msg', 'Erro interno');
                        res.redirect('/');
                    });
                }
            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro interno');
                res.redirect('/');
            })
        }).catch(() => {
            req.flash('error_msg', 'Erro interno');
            res.redirect('/');
        });
    }
}

exports.login = function (req, res, next) {
    let errosFormulario = validaCamposLogin(req.body);

    if(errosFormulario.length > 0){
        res.render('../views/layouts/auth/login', {errosFormulario: errosFormulario});
    } else {
        passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/auth/login",
            failureFlash: true
        })(req, res, next);
    }
}

exports.logout = function (req, res) {
    req.logout();
    req.flash('success_msg', "Deslogando com sucesso!");
    res.redirect("/");
}