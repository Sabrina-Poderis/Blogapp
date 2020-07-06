require("../models/User");
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = mongoose.model("users");

exports.fillUserForm = function(req, res) {
    User.findOne({_id:req.params.id}).lean().then((user) => {
        res.render('../views/layouts/profile/update-registry', {user: user});
    }).catch(() => {
        req.flash('error_msg', 'Erro! Não foi possível editar o usuario');
        res.redirect('/perfil');
    })
}

function fieldsValidatorProfile (fields){
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
    return formErrors;
}

function fieldsValidatorPassword (fields){
    let formErrors = [];

    if(!fields.new_password || typeof fields.new_password == undefined || fields.new_password == null){
        formErrors.push({error: "Senha inválida"})
    } else if(fields.new_password.length < 5){
        formErrors.push({error: "Sua senha deverá ter no mínimo 5 caracteres"})
    } 
    
    if(!fields.password_confirmation || typeof fields.password_confirmation == undefined || fields.password_confirmation == null){
        formErrors.push({error: "Confirme sua senha"})
    } else if(fields.new_password != fields.password_confirmation){
        formErrors.push({error: "As senhas estão diferentes"})
    }

    return formErrors;
}

exports.updateUser = function(req, res) {
    let formErrors = fieldsValidatorProfile(req.body);

    if(formErrors.length > 0){
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

        if(formErrors.length > 0){
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