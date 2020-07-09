require('../models/Post');
require("../models/User");
const mongoose      = require("mongoose");
const bcrypt        = require("bcryptjs");
const passport      = require("passport");
const User          = mongoose.model("users");
const Post          = mongoose.model('posts');
const arrayToObject = require('../helpers/arrayToObject');

function fieldsValidatorRegistry (fields){
    let formErrors = new Array();

    if(!fields.name || typeof fields.name == undefined || fields.name == null){
        formErrors.fieldNameError = 'Nome inválido';
    } else if(fields.name.length < 3){
        formErrors.fieldNameError = "Seu nome deve ter no mínimo 3 caracteres";
    } 

    if(!fields.surname || typeof fields.surname == undefined || fields.surname == null){
        formErrors.fieldSurnameError = "Sobrenome inválido";
    } else if(fields.surname.length < 2){
        formErrors.fieldSurnameError = "Seu sobrenome deve ter no mínimo 2 caracteres";
    } 

    if(!fields.user_name || typeof fields.user_name == undefined || fields.user_name == null){
        formErrors.fieldUsernameError =  "Nome de usuário inválido";
    } else if(fields.user_name.length < 5){
        formErrors.fieldUsernameError = "Seu nome de usuário deve ter no mínimo 5 caracteres";
    } 

    if(!fields.email || typeof fields.email == undefined || fields.email == null){
        formErrors.fieldEmailError = "E-mail inválido";
    } else if(fields.email.length < 5){
        formErrors.fieldEmailError = "Seu e-mail deve ter no mínimo 5 caracteres";
    } 

    if(!fields.password || typeof fields.password == undefined || fields.password == null){
        formErrors.fieldPasswordError = "Senha inválida";
    } else if(fields.password.length < 5){
        formErrors.fieldPasswordError = "Sua senha deve ter no mínimo 5 caracteres";
    } 
    
    if(!fields.password_confirmation || typeof fields.password_confirmation == undefined || fields.password_confirmation == null){
        formErrors.fieldPasswordConfirmationError = "Confirme sua senha!";
    } else if(fields.password != fields.password_confirmation){
        formErrors.fieldPasswordConfirmationError = "As senhas estão diferentes";
    }

    return arrayToObject(formErrors);
}

function fieldsValidatorLogin (fields){
    let formErrors = new Array();

    if(!fields.email || typeof fields.email == undefined || fields.email == null){
        formErrors.fieldEmailError = "E-mail inválido";
    } else if(fields.email.length < 5){
        formErrors.fieldEmailError = "Seu e-mail deve ter no mínimo 5 caracteres";
    } 

    if(!fields.password || typeof fields.password == undefined || fields.password == null){
        formErrors.fieldPasswordError = "Senha inválida";
    }

    return arrayToObject(formErrors);
}

exports.createAccount = function (req, res, next) {
    let formErrors = fieldsValidatorRegistry(req.body);

    if(Object.keys(formErrors).length != 0){
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

    if(Object.keys(formErrors).length != 0){
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

exports.login_side = function (req, res, next) {
    let formErrors = fieldsValidatorLogin(req.body);

    if(Object.keys(formErrors).length != 0){
        Post.find({status: 'aprovado'}).populate('category').sort({date:'desc'}).lean().then((posts) => {
            res.render('../views/index', {posts: posts, formErrors: formErrors})
        }).catch((error) => {
            req.flash('error_msg', 'Ocorreu um erro!' + error);
            res.redirect('/');
        });
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