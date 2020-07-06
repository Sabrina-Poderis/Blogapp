require('../models/Category');
require('../models/Post');
const mongoose        = require('mongoose');
const Category        = mongoose.model('categories');
const Post            = mongoose.model('posts');
const {slugFormatter} = require('../helpers/slugFormatter');

exports.showCategories = function(req, res) {
    Category.find().sort({name: 'asc'}).lean().then((categories) => {
        res.render('../views/layouts/category/index', {categories: categories});
    }).catch((error) => {
        req.flash('error_msg', 'Ocorreu um erro!' + error);
        res.redirect('/');
    });
}

exports.showCategoryPosts = function(req, res) {
    Category.findOne({slug:req.params.slug}).lean().then((category) => {
        if(category){
            Post.find({category: category._id, status: 'aprovado'}).lean().then((posts) => {
                res.render('../views/layouts/category/category-posts', {posts: posts, category: category});
            }).catch(() => {
                req.flash('error_msg', 'Erro! Não foi possível listar os posts');
                res.redirect('/');
            })
        } else {
            req.flash('error_msg', 'Erro! Esta categoria não existe ' + category);
            res.redirect('/');
        }
    }).catch(() => {
        req.flash('error_msg', 'Erro interno ao carregar esta categoria');
        res.redirect('/');
    })
}

exports.fillCategoriesComboBox = function (req, res) {
    Category.find().lean().then((categories) => {
        res.render('../views/layouts/post/create-post', {categories: categories})
    }).catch((error) => {
        req.flash('error_msg', 'Ocorreu um erro!' + error);
        res.redirect('/');
    });
}

 // Gerenciamento de Categorias
    function fieldsValidatorCategory (fields){
        let formErrors = [];

        if(!fields.name || typeof fields.name == undefined || fields.name == null){
            formErrors.push({error: 'Nome inválido'});
        } else if(fields.name.length < 2){
            formErrors.push({error: "Nome da categoria é muito pequena"});
        }

        return formErrors;
    }

    exports.listCategories = function (req, res){
        Category.find().sort({date:'desc'}).lean().then((categories) => {
            res.render('../views/layouts/admin/category/index', {categories: categories})
        }).catch((error) => {
            req.flash('error_msg', 'Ocorreu um erro!' + error);
            res.redirect('/admin');
        });
    }

    exports.createCategory = function (req, res){
        let formErrors = fieldsValidatorCategory(req.body);

        if(formErrors.length > 0){
            res.render('../views/layouts/admin/category/create-category', {formErrors: formErrors});
        } else {
            const newCategory = {
                name: req.body.name,
                slug: slugFormatter(req.body.name)
            };
        
            new Category(newCategory).save().then(() => {
                req.flash('success_msg', 'Categoria salva com sucesso!');
                res.redirect('/admin/categorias');
            }).catch((error) => {
                req.flash('error_msg', 'Ocorreu um erro!' + error);
                res.redirect('/admin/categorias');
            });
        }
    }

    exports.fillCategoriesForm = function (req, res){
        Category.findOne({_id:req.params.id}).lean().then((category) => {
            res.render('../views/layouts/admin/category/update-category', {category: category});
        }).catch(() => {
            req.flash('error_msg', 'Erro! Não foi possível editar a categoria porque ela não existe');
            res.redirect('/admin/categorias');
        })
    }

    exports.updateCategory = function (req, res){
        Category.findOne({_id:req.body.id}).then((category) => {
            let formErrors = fieldsValidatorCategory(req.body);
    
            if(formErrors.length > 0){
                req.flash('error_msg', 'Erro ao editar categoria! Existiam campos em branco!');
                res.redirect('/admin/category/edit/' + req.body.id);
            } else {
                category.name = req.body.name;
                category.slug = slugFormatter(req.body.name);

                category.save().then(() => {
                    req.flash('success_msg', 'Categoria editada com sucesso!');
                    res.redirect('/admin/categorias');
                }).catch((error) => {
                    req.flash('error_msg', 'Erro ao editar categoria! ' + error);
                    res.redirect('/admin/categorias');
                });
            }
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao editar categoria! ' + error);
            res.redirect('/admin/categorias');
        });
    }

    exports.deleteCategory = function (req, res){
        Category.deleteOne({_id: req.body.id}).then(() => {
            req.flash('success_msg', 'Categoria excluida com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((error) => {
            req.flash('error_msg', 'Erro ao deletar categoria! ' + error);
            res.redirect('/admin/categorias');
        });
    }