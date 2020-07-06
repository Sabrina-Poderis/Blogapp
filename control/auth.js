require("../models/User");
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const passport = require("passport");
const User     = mongoose.model("users");

function fieldsValidatorRegistry (fields){
    let formErrors = [];

    if(!fields.name || typeof fields.name == undefined || fields.name == null || fields.name.length < 2){
        formErrors.push({error: "Nome inválido"})
    }

    if(!fields.surname || typeof fields.surname == undefined || fields.surname == null || fields.surname.length < 2){
        formErrors.push({error: "Sobrenome inválido"})
    }

    if(!fields.user_name || typeof fields.user_name == undefined || fields.user_name == null || fields.user_name.length < 2){
        formErrors.push({error: "Nome de usuário inválido"})
    }

    if(!fields.email || typeof fields.email == undefined || fields.email == null || fields.email.length < 2){
        formErrors.push({error: "E-mail inválido"})
    }

    if(!fields.password || typeof fields.password == undefined || fields.password == null){
        formErrors.push({error: "Senha inválida"})
    } else if(fields.password.length < 5){
        formErrors.push({error: "Sua senha deverá ter no mínimo 5 caracteres"})
    } 
    
    if(!fields.password_confirmation || typeof fields.password_confirmation == undefined || fields.password_confirmation == null){
        formErrors.push({error: "Confirme sua senha"})
    } else if(fields.password != fields.password_confirmation){
        formErrors.push({error: "As senhas estão diferentes"})
    }

    return formErrors;
}

function fieldsValidatorLogin (fields){
    let formErrors = [];

    if(!fields.email || typeof fields.email == undefined || fields.email == null || fields.email.length < 2){
        formErrors.push({error: "E-mail inválido"})
    }

    if(!fields.password || typeof fields.password == undefined || fields.password == null || fields.password.length < 3){
        formErrors.push({error: "Senha inválida"})
    } 

    return formErrors;
}

exports.createAccount = function (req, res, next) {
    let formErrors = fieldsValidatorRegistry(req.body);

    if(formErrors.length > 0){
        res.render('../views/layouts/auth/registry', {formErrors: formErrors});
    } else {
        User.findOne().lean().then((findUser) => {
            if(findUser){
                defineAdmin = false;
                defineOwner = false;
            } else {
                defineAdmin = true;
                defineOwner = true;
            }
            User.findOne({email: req.body.email}).lean().then((findEmail) => {
                if (findEmail) {
                    req.flash('error_msg', 'Esse email ja possui um cadastro no sistema!');
                    res.redirect('/auth/registry');
                } else {
                    User.findOne({user_name: req.body.user_name}).lean().then((findUserName) => {
                        if (findUserName) {
                            req.flash('error_msg', 'Já existe um usuário com esse nome cadastrado no sistema!');
                            res.redirect('/auth/registry');
                        } else {
                            const newUser = new User({
                                name     : req.body.name,
                                surname  : req.body.surname,
                                user_name: req.body.user_name,
                                email    : req.body.email,
                                password : req.body.password,
                                eAdmin   : defineAdmin,
                                eOwner   : defineOwner
                            });
                
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(newUser.password, salt, (err, hash) => {
                                    if (err) {
                                        req.flash('error_msg', 'Houve um erro durante o salvamento do usuário');
                                        res.redirect('/');
                                    } else {
                                        newUser.password = hash;
                                        newUser.save().then(() => {
                                            req.flash('success_msg', 'Usuário cadastrado com sucesso!');
                                            passport.authenticate("local", {
                                                successRedirect: "/",
                                                failureRedirect: "/auth/login",
                                                failureFlash: true
                                            })(req, res, next);
                                        }).catch((error) => {
                                            req.flash('error_msg', 'Houve um erro na criação do usuário' + error);
                                            res.redirect('/auth/registry');
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
    let formErrors = fieldsValidatorLogin(req.body);

    if(formErrors.length > 0){
        res.render('../views/layouts/auth/login', {formErrors: formErrors});
    } else {
        passport.authenticate("local",
            {
                successRedirect: "/",
                failureRedirect: "/auth/login",
                failureFlash: true
            }
        )(req, res, next);
    }
}

exports.logout = function (req, res) {
    req.logout();
    req.flash('success_msg', "Deslogando com sucesso!");
    res.redirect("/");
}