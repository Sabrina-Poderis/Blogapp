require("../models/User");
const mongoose = require("mongoose");
const User     = mongoose.model("users");

exports.fillUserTable = function(req, res) {
    User.find().sort({name:'desc'}).lean().then((users) => {
        res.render('../views/layouts/admin/user/index', {users: users})
    }).catch((error) => {
        req.flash('error_msg', 'Ocorreu um erro!' + error);
        res.redirect('/admin');
    });
}

exports.updateUserStatus = function(req, res) {
    User.findOne({_id:req.body.id}).then((user) => {
        if(user.eOwner){
            req.flash('error_msg', 'Não é possível editar o status do proprietario!');
            res.redirect('/admin/usuarios');
        } else {
            user.eAdmin = req.body.eAdmin;
            user.save().then(() => {
               req.flash('success_msg', 'Usuário editado com sucesso!');
               res.redirect('/admin/usuarios');
            }).catch((error) => {
                req.flash('error_msg', 'Erro ao editar usuario! ' + error);
                res.redirect('/admin/usuarios');
            });
        }
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao editar usuario! ' + error);
        res.redirect('/admin/usuarios');
    });
}

exports.blockUser = function(req, res) {
    User.findOne({_id:req.body.id}).then((user) => {
        if(user.eOwner){
            req.flash('error_msg', 'Não é possível bloquear o proprietario!');
            res.redirect('/admin/usuarios');
        } else {
            user.eBlocked = req.body.eBlocked;
            user.save().then(() => {
               req.flash('success_msg', 'Usuário bloqueado com sucesso!');
               res.redirect('/admin/usuarios');
            }).catch((error) => {
                req.flash('error_msg', 'Erro ao bloqueado usuario! ' + error);
                res.redirect('/admin/usuarios');
            });
        }
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao editar usuario! ' + error);
        res.redirect('/admin/usuarios');
    });
}

exports.deleteUser = function (req, res) {
    User.findOne({_id:req.body.id}).then((user) => {
        if(user.eOwner){
            req.flash('error_msg', 'Não é possível excluir o proprietario!');
            res.redirect('/admin/usuarios');
        } else {
            User.deleteOne({_id: req.body.id}).then(() => {
                req.flash('success_msg', 'Usuario excluido com sucesso!');
                res.redirect('/admin/usuarios');
            }).catch((error) => {
                req.flash('error_msg', 'Erro ao deletar usuario! ' + error);
                res.redirect('/admin/usuarios');
            });
        }
    }).catch((error) => {
        req.flash('error_msg', 'Erro ao editar usuario! ' + error);
        res.redirect('/admin/usuarios');
    });
}