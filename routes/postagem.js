require('../models/Postagem');
const router    = require('express').Router();
const mongoose  = require('mongoose');
const Postagem  = mongoose.model('postagens');

router.get('/:slug', (req,res) => {
    const slug = req.params.slug
    Postagem.findOne({slug}).then(postagem => {
        if(postagem){
            const post = {
                titulo: postagem.titulo,
                data: postagem.data,
                conteudo: postagem.conteudo
            }
            res.render('../views/layouts/postagem/index', post)
        }else{
            req.flash("error_msg", "Essa postagem nao existe")
            res.redirect("/")
        }
    }).catch(err => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
    })
});

module.exports = router;