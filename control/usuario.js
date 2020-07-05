require("../models/Usuario");
const mongoose = require("mongoose");
const Usuario  = mongoose.model("usuarios");

exports.preencheTabelaUsuario = function(req, res) {
    Usuario.find().sort({nome:'desc'}).lean().then((usuarios) => {
        res.render('../views/layouts/admin/usuario/index', {usuarios: usuarios})
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro!' + erro);
        res.redirect('/admin');
    });
}

exports.editaStatusUsuario = function(req, res) {
    Usuario.findOne({_id:req.body.id}).then((usuario) => {
        if(usuario.eDono){
            req.flash('error_msg', 'Não é possível editar o status do proprietario!');
            res.redirect('/admin/usuarios');
        } else {
            usuario.eAdmin = req.body.eAdmin;
            usuario.save().then(() => {
               req.flash('success_msg', 'Usuário editado com sucesso!');
               res.redirect('/admin/usuarios');
            }).catch((erro) => {
                req.flash('error_msg', 'Erro ao editar usuario! ' + erro);
                res.redirect('/admin/usuarios');
            });
        }
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao editar usuario! ' + erro);
        res.redirect('/admin/usuarios');
    });
}

exports.bloqueiaUsuario = function(req, res) {
    Usuario.findOne({_id:req.body.id}).then((usuario) => {
        if(usuario.eDono){
            req.flash('error_msg', 'Não é possível bloquear o proprietario!');
            res.redirect('/admin/usuarios');
        } else {
            usuario.eBloq = req.body.eBloq;
            usuario.save().then(() => {
               req.flash('success_msg', 'Usuário bloqueado com sucesso!');
               res.redirect('/admin/usuarios');
            }).catch((erro) => {
                req.flash('error_msg', 'Erro ao bloqueado usuario! ' + erro);
                res.redirect('/admin/usuarios');
            });
        }
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao editar usuario! ' + erro);
        res.redirect('/admin/usuarios');
    });
}

exports.deletaUsuarioAdmin = function (req, res) {
    Usuario.findOne({_id:req.body.id}).then((usuario) => {
        if(usuario.eDono){
            req.flash('error_msg', 'Não é possível excluir o proprietario!');
            res.redirect('/admin/usuarios');
        } else {
            Usuario.deleteOne({_id: req.body.id}).then(() => {
                req.flash('success_msg', 'Usuario excluido com sucesso!');
                res.redirect('/admin/usuarios');
            }).catch((erro) => {
                req.flash('error_msg', 'Erro ao deletar usuario! ' + erro);
                res.redirect('/admin/usuarios');
            });
        }
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao editar usuario! ' + erro);
        res.redirect('/admin/usuarios');
    });
}