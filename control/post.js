require('../models/Post');
require('../models/User');
require('../models/Category');
const mongoose        = require('mongoose');
const Post            = mongoose.model('posts');
const User            = mongoose.model('users');
const Category        = mongoose.model('categories');
const {slugFormatter} = require('../helpers/slugFormatter');
const arrayToObject = require('../helpers/arrayToObject');

//Mostra Postagens
    exports.showPost = function (req, res) {        
        Post.findOne({slug: req.params.slug}).then(foundPost => {
            if(foundPost){
                const post = {
                    title  : foundPost.title,
                    date   : foundPost.date,
                    content: foundPost.content
                }
                res.render('../views/layouts/post/show-post', post)
            }else{
                req.flash("error_msg", "Essa postagem nao existe")
                res.redirect("/")
            }
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    };

    exports.listApprovedPosts_HomePage = function (req, res) {
        Post.find({status: 'aprovado'}).populate('category').sort({date:'desc'}).lean().then((posts) => {
            res.render('../views/index', {posts: posts})
        }).catch((error) => {
            req.flash('error_msg', 'Ocorreu um erro!' + error);
            res.redirect('/');
        });
    }

    exports.listApprovedPosts_PostsPage = function (req, res) {
        Post.find({status: 'aprovado'}).populate('category').sort({date:'desc'}).lean().then((posts) => {
            res.render('../views/layouts/post/index', {posts: posts})
        }).catch((error) => {
            req.flash('error_msg', 'Ocorreu um erro!' + error);
            res.redirect('/');
        });
    }

    exports.listUserPosts = function (req, res) {
        Post.find({user: res.locals.user}).populate('category').populate('user').sort({date:'desc'}).lean().then((posts) => {
            res.render('../views/layouts/post/user-posts', {posts: posts})
        }).catch((error) => {
            req.flash('error_msg', 'Ocorreu um erro!' + error);
            res.redirect('/');
        });
    }

//Operações Postagens
    function fieldsValidatorPost (fields){
        let formErrors = new Array();

        if(!fields.title || typeof fields.title == undefined || fields.title == null){
            formErrors.fieldTitleError = 'Título inválido';           
        } else if(fields.title.length < 2){
            formErrors.fieldTitleError = "Título é muito pequeno";
        }
        
        if(!fields.description || typeof fields.description == undefined || fields.description == null){
            formErrors.fieldDescriptionError =  'Descrição inválida';
        } else if(fields.description.length < 2){
            formErrors.fieldDescriptionError =  "Descrição é muito pequena";
        }
        
        if(!fields.content || typeof fields.content == undefined || fields.content == null){
            formErrors.fieldContentError = 'Conteúdo inválido';
        } else if(fields.content.length < 2){
            formErrors.fieldContentError = "Conteúdo é muito pequeno";
        }
        
        if(!fields.category || typeof fields.category == undefined || fields.category == null){
            formErrors.fieldCategoryError = 'Categoria inválida';
        } 
        
        if(!fields.user_id || typeof fields.user_id == undefined || fields.user_id == null){
            formErrors.fieldUserError = 'Usuário inválido';
        }

        return arrayToObject(formErrors);
    }

    exports.createPost = function (req, res) {
        let formErrors = fieldsValidatorPost(req.body);
        let defineStatus;

        if(Object.keys(formErrors).length != 0){
            Category.find().lean().then((categories) => {
                res.render('../views/layouts/post/create-post', {categories: categories, formErrors: formErrors})
            }).catch((error) => {
                req.flash('error_msg', 'Ocorreu um erro!' + error);
                res.redirect('/');
            });
        } else {
            User.findOne({_id:req.body.user_id}).lean().then((user) => {
                if(user.eAdmin == true){
                    defineStatus = 'aprovado';
                } else {
                    defineStatus = 'em análise';
                }
                
                const newPost = {
                    title      : req.body.title,
                    slug       : slugFormatter(req.body.title),
                    description: req.body.description,
                    content    : req.body.content,
                    category   : req.body.category,
                    user       : req.body.user_id,
                    status     : defineStatus
                };
                    
                new Post(newPost).save().then(() => {
                    req.flash('success_msg', 'Postagem salva com sucesso!');
                    res.redirect('/perfil/minhas-postagens');
                }).catch((erro) => {
                    req.flash('error_msg', 'Ocorreu um erro!' + erro);
                    res.redirect('/perfil/minhas-postagens');
                }); 
            }).catch((error) => {
                req.flash('error_msg', 'Erro!' + error);
                res.redirect('/perfil/minhas-postagens');
            });
        }
    }

    exports.fillPostForm = function (req, res) {
        Post.findOne({_id:req.params.id}).lean().populate('category').then((post) => {
            Category.find().lean().then((categories) => {
                res.render('../views/layouts/post/update-post', {categories: categories, post: post});
            }).catch(() => {
                req.flash('error_msg', 'Erro! Não foi possível listar as categorias');
                res.redirect('/perfil/minhas-postagens');
            });
        }).catch(() => {
            req.flash('error_msg', 'Erro! Não foi possível editar a postagem porque ela não existe');
            res.redirect('/perfil/minhas-postagens');
        });
    }

    exports.updatePost = function (req, res) {
        Post.findOne({_id:req.body.post_id}).then((post) => {
            let formErrors = fieldsValidatorPost(req.body);
            let defineStatus;

            if(Object.keys(formErrors).length != 0){
                req.flash('error_msg', 'Erro ao editar postagem! Existiam campos em branco!');
                res.redirect('/perfil/minhas-postagens/edit/' + req.body.post_id);
            } else {
                User.findOne({_id:req.body.user_id}).then((user) => {
                    if(user.eAdmin == true){
                        defineStatus = 'aprovado';
                    } else {
                        defineStatus = 'em análise';
                    }                  

                    post.title       = req.body.title;
                    post.slug        = slugFormatter(req.body.title);
                    post.description = req.body.description;
                    post.content     = req.body.content;
                    post.category    = req.body.category;
                    post.status      = defineStatus;

                    post.save().then(() => {
                        req.flash('success_msg', 'Postagem editada com sucesso!');
                        res.redirect('/perfil/minhas-postagens');
                    }).catch((error) => {
                        req.flash('error_msg', 'Erro ao editar postagem! ' + error);
                        res.redirect('/perfil/minhas-postagens');
                    });
                }).catch((error) => {
                    req.flash('error_msg', 'Erro! ' + error);
                    res.redirect('/perfil/minhas-postagens');
                });
            }
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao editar postagem! ' + error);
            res.redirect('/perfil/minhas-postagens');
        });
    }

    exports.deletePost = function (req, res) { 
        Post.deleteOne({_id: req.body.id}).then(() => {
            req.flash('success_msg', 'Postagem excluida com sucesso!');
            res.redirect('/perfil/minhas-postagens');
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao deletar postagem! ' + error);
            res.redirect('/perfil/minhas-postagens');
        });
    }

//Gerenciamento de Postagens
    exports.fillPostTable = function  (req, res) {
        Post.find().sort({name:'desc'}).populate('category').populate('user').lean().then((posts) => {
            res.render('../views/layouts/admin/post/index', {posts: posts})
        }).catch((error) => {
            req.flash('error_msg', 'Ocorreu um erro!' + error);
            res.redirect('/admin');
        });
    }

    exports.showPostUnderReview = function (req, res) {
        Post.findOne({slug: req.params.slug}).then(foundPost => {
            if(foundPost){
                const post = {
                    title  : foundPost.title,
                    data   : foundPost.data,
                    content: foundPost.content,
                    id     : foundPost._id
                }
                res.render('../views/layouts/admin/post/post-review', post)
            }else{
                req.flash("error_msg", "Essa postagem nao existe")
                res.redirect("/")
            }
        }).catch((error) => {
            req.flash("error_msg", "Houve um erro interno" + error)
            res.redirect("/")
        })
    };

    exports.updateStatus = function (req, res){
        Post.findOne({_id:req.body.id}).then((post) => {
            post.status = req.body.review_result;
            
            post.save().then(() => {
                req.flash('success_msg', 'Usuário editado com sucesso!');
                res.redirect('/admin/postagens');
            }).catch((error) => {
                req.flash('error_msg', 'Erro ao editar usuario! ' + error);
                res.redirect('/admin/postagens');
            });
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao editar postagem! ' + error);
            res.redirect('/admin/postagens');
        });
    }

    exports.deletePost_Admin = function (req, res) { 
        Post.deleteOne({_id: req.body.id}).then(() => {
            req.flash('success_msg', 'Postagem excluida com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao deletar postagem! ' + erro);
            res.redirect('/admin/postagens');
        });
    }