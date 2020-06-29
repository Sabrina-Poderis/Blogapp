require("../models/Usuario");
const express  = require("express");
const router   = express.Router();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const passport = require("passport");
const Usuario  = mongoose.model("usuarios");

router.get('/registro', (req, res) => {
    res.render('../views/layouts/usuario/registro');
});

router.post('/registro', (req, res) => {
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
                nome:  req.body.nome,
                email: req.body.email,
                senha: req.body.senha,
                eAdmin: false
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
                            res.redirect('/');
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

module.exports = router;