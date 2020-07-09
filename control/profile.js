require("../models/User");
const mongoose      = require("mongoose");
const bcrypt        = require("bcryptjs");
const User          = mongoose.model("users");
const arrayToObject = require('../helpers/arrayToObject');

exports.fillUserForm = function(req, res) {
    User.findOne({_id:req.params.id}).lean().then((user) => {
        res.render('../views/layouts/profile/update-registry', {user: user});
    }).catch(() => {
        req.flash('error_msg', 'Erro! Não foi possível editar o usuario');
        res.redirect('/perfil');
    })
}

function fieldsValidatorProfile (fields){
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

    return arrayToObject(formErrors);
}

function fieldsValidatorPassword (fields){
    let formErrors = new Array();

    if(!fields.new_password || typeof fields.new_password == undefined || fields.new_password == null){
        formErrors.fieldNewPasswordError = "Senha inválida";
    } else if(fields.new_password.length < 5){
        formErrors.fieldNewPasswordError ="Sua senha deverá ter no mínimo 5 caracteres";
    } 
    
    if(!fields.password_confirmation || typeof fields.password_confirmation == undefined || fields.password_confirmation == null){
        formErrors.fieldPasswordConfirmationError = "Confirme sua senha";
    } else if(fields.new_password != fields.password_confirmation){
        formErrors.fieldPasswordConfirmationError = "As senhas estão diferentes";
    }

    return arrayToObject(formErrors);
}

exports.updateUser = function(req, res) {
    let formErrors = fieldsValidatorProfile(req.body);

    if(Object.keys(formErrors).length != 0){
        res.render('../views/layouts/profile/update-registry', {formErrors: formErrors});
    } else {
        User.findOne({user_name:req.body.user_name}).then((user) => {
            user.name      = req.body.name;
            user.surname   = req.body.surname;
            user.user_name = req.body.user_name;
            user.email     = req.body.email;
        
            user.save().then(() => {
                req.flash('success_msg', 'Usuario editada com sucesso!');
                res.redirect('/perfil');
            }).catch((error) => {
                req.flash('error_msg', 'Erro ao editar usuario! ' + error);
                res.redirect('/perfil');
            });
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao editar usuario! ' + error);
            res.redirect('/perfil');
        });


        User.findOne({_id:req.body.id}).then((user) => {
            user.name      = req.body.name;
            user.surname   = req.body.surname;
            user.user_name = req.body.user_name;
            user.email     = req.body.email;
        
            user.save().then(() => {
                req.flash('success_msg', 'Usuario editada com sucesso!');
                res.redirect('/perfil');
            }).catch((error) => {
                req.flash('error_msg', 'Erro ao editar usuario! ' + error);
                res.redirect('/perfil');
            });
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao editar usuario! ' + error);
            res.redirect('/perfil');
        });
    }
}

exports.updatePassword = function(req, res){
    User.findOne({_id:req.body.id}).then((user) => {
        let formErrors = fieldsValidatorPassword(req.body);

        if(Object.keys(formErrors).length != 0){
            res.render('../views/layouts/profile/update-password', {formErrors: formErrors});
        } else {
            user.password  = req.body.new_password;
        
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if (err) {
                        req.flash('error_msg', 'Houve um erro durante o salvamento do usuário');
                        res.redirect('/perfil');
                    } else {
                        user.password = hash;
                        user.save().then(() => {
                            req.flash('success_msg', 'Senha mudada com sucesso!');
                            res.redirect('/perfil');
                        }).catch((error) => {
                            req.flash('error_msg', 'Houve um erro' + error);
                            res.redirect('/perfil/');
                        });
                    }
                });
            });
        }
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao editar Senha! ' + error);
        res.redirect('/perfil');
    });
}

exports.deleteUser = function(req, res){
    User.findOne({_id:req.body.id}).then((user) => {
        if(user.eOwner == true){
            req.flash('error_msg', 'Não é excluir sua conta se você for o proprietario!');
            res.redirect('/perfil');
        } else {
            User.deleteOne({_id: req.body.id}).then(() => {
                req.flash('success_msg', 'Usuario excluido com sucesso!');
                res.redirect('/');
            }).catch((error) => {
                req.flash('error_msg', 'Erro ao deletar usuario! ' + error);
                res.redirect('/');
            });
        }
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao editar usuario! ' + error);
        res.redirect('/perfil');
    });
}

exports.listAdminUsers = function(req, res){
    User.find({eAdmin: true, eOwner: false}).sort({name: 'asc'}).lean().then((users) => {
        res.render('../views/layouts/profile/transfers-ownership', {users: users})
    }).catch((error) => {
        req.flash('error_msg', 'Ocorreu um erro!' + error);
        res.redirect('/');
    });
}

exports.transfersOwnership = function(req, res){
    User.findOne({eOwner: true}).then((currentOwner) => {
        currentOwner.eOwner = false;

        currentOwner.save().then(() => {
            User.findOne({_id:req.params.id}).then((newOwner) => {
                newOwner.eOwner  = true;
                newOwner.eAdmin  = true;

                newOwner.save().then(() => {
                    req.flash('success_msg', 'Usuario editada com sucesso!');
                    res.redirect('/perfil');
                }).catch((error) => {
                    req.flash('error_msg', 'Erro ao editar usuario! ' + error);
                    res.redirect('/perfil');
                });
            }).catch((error) => {
                req.flash('error_msg', 'Erro ao editar usuario! ' + error);
                res.redirect('/perfil');
            });
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao editar usuario! ' + error);
            res.redirect('/perfil');
        });
    });
}