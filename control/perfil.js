require("../models/Usuario");
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const Usuario  = mongoose.model("usuarios");

exports.carregaDadosUsuario = function(req, res) {
    Usuario.findOne({_id:req.params.id}).lean().then((usuario) => {
        res.render('../views/layouts/perfil/edit-registro', {usuario: usuario});
    }).catch(() => {
        req.flash('error_msg', 'Erro! Não foi possível editar o usuario');
        res.redirect('/perfil');
    })
}

function validaCamposPerfil (dados){
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
    return errosFormulario;
}

function validaCamposSenha (dados){
    let errosFormulario = [];

    if(!dados.senha_nova || typeof dados.senha_nova == undefined || dados.senha_nova == null){
        errosFormulario.push({texto: "Senha inválida"})
    } else if(dados.senha_nova.length < 5){
        errosFormulario.push({texto: "Sua senha deverá ter no mínimo 5 caracteres"})
    } 
    
    if(!dados.senha_confirmada || typeof dados.senha_confirmada == undefined || dados.senha_confirmada == null){
        errosFormulario.push({texto: "Confirme sua senha"})
    } else if(dados.senha_nova != dados.senha_confirmada){
        errosFormulario.push({texto: "As senhas estão diferentes"})
    }

    return errosFormulario;
}

exports.editUsuario = function(req, res) {
    let errosFormulario = validaCamposPerfil(req.body);

    if(errosFormulario.length > 0){
        res.render('../views/layouts/perfil/edit-registro', {errosFormulario: errosFormulario});
    } else {
        Usuario.findOne({_id:req.body.id}).then((usuario) => {
            usuario.nome         = req.body.nome;
            usuario.sobrenome    = req.body.sobrenome;
            usuario.nome_usuario = req.body.nome_usuario;
            usuario.email        = req.body.email;
        
            usuario.save().then(() => {
            req.flash('success_msg', 'Usuario editada com sucesso!');
            res.redirect('/perfil');
            }).catch((erro) => {
                req.flash('error_msg', 'Erro ao editar usuario! ' + erro);
                res.redirect('/perfil');
            });
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao editar usuario! ' + erro);
            res.redirect('/perfil');
        });
    }
}

exports.editSenha = function(req, res){
    Usuario.findOne({_id:req.body.id}).then((usuario) => {
        let errosFormulario = validaCamposSenha(req.body);

        if(errosFormulario.length > 0){
            res.render('../views/layouts/perfil/edit-senha', {errosFormulario: errosFormulario});
        } else {
            usuario.senha  = req.body.senha_nova;
        
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(usuario.senha, salt, (err, hash) => {
                    if (err) {
                        req.flash('error_msg', 'Houve um erro durante o salvamento do usuário');
                        res.redirect('/perfil');
                    } else {
                        usuario.senha = hash;
                        usuario.save().then(() => {
                            req.flash('success_msg', 'Senha mudada com sucesso!');
                            res.redirect('/perfil');
                        }).catch((erro) => {
                            req.flash('error_msg', 'Houve um erro' + erro);
                            res.redirect('/perfil/');
                        });
                    }
                });
            });
        }
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao editar Senha! ' + erro);
        res.redirect('/perfil');
    });
}

exports.deletaUsuario = function(req, res){
    Usuario.findOne({_id:req.body.id}).then((usuario) => {
        // if(usuario.eDono == true){
        //     req.flash('error_msg', 'Não é excluir sua conta se você for o proprietario!');
        //     res.redirect('/perfil');
        // } else {
            Usuario.deleteOne({_id: req.body.id}).then(() => {
                req.flash('success_msg', 'Usuario excluido com sucesso!');
                res.redirect('/');
            }).catch((erro) => {
                req.flash('error_msg', 'Erro ao deletar usuario! ' + erro);
                res.redirect('/');
            });
        // }
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao editar usuario! ' + erro);
        res.redirect('/perfil');
    });
}

exports.transfereDono = function(req, res){
    Usuario.find().sort({nome: 'asc'}).lean().then((usuarios) => {
        res.render('../views/layouts/perfil/transferir-dono', {usuarios: usuarios})
    }).catch((erro) => {
        req.flash('error_msg', 'Ocorreu um erro!' + erro);
        res.redirect('/');
    });
}

exports.transfereDonoDois = function(req, res){
    Usuario.findOne({eDono: true}).then((usuarioDonoAtual) => {
        usuarioDonoAtual.eDono  = false;

        usuarioDonoAtual.save().then(() => {
            Usuario.findOne({_id:req.params.id}).then((usuarioDonoNovo) => {
                usuarioDonoNovo.eDono  = true;
                usuarioDonoNovo.eAdmin = true;

                usuarioDonoNovo.save().then(() => {
                    req.flash('success_msg', 'Usuario editada com sucesso!');
                    res.redirect('/perfil');
                }).catch((erro) => {
                    req.flash('error_msg', 'Erro ao editar usuario! ' + erro);
                    res.redirect('/perfil');
                });
            }).catch((erro) => {
                req.flash('error_msg', 'Erro ao editar usuario! ' + erro);
                res.redirect('/perfil');
            });
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao editar usuario! ' + erro);
            res.redirect('/perfil');
        });
    });

}