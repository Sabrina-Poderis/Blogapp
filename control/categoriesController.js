require('../models/Category');
require('../models/Post');
const mongoose        = require('mongoose');
const Category        = mongoose.model('categories');
const Post            = mongoose.model('posts');
const {slugFormatter} = require('../helpers/slugFormatter');
const arrayToObject   = require('../helpers/arrayToObject');

exports.getCategories = async function(req, res){
    try{
        const categories = await Category.getCategories();
        res.render('sobre', {categories})
    } catch (error) {
        res.render('error', {error});
    }
}

exports.list = async function(req, res) {
    try{
        const categories = await Category.getCategories();
        res.render('layouts/category/list', {categories})
    } catch (error) {
        res.render('error', {error});
    }
}

exports.listCategoryPosts = async function(req, res) {
    try{
        const category = await Category.findOne({slug:req.params.slug}).lean();
        
        if(category){
            
            const posts      = await Post.find({category: category._id.toString(), status: 'aprovado'}).populate('category').lean();
            const categories = await Category.getCategories();

            res.render('layouts/category/list-category-posts', {posts, category, categories});
        } else {
            res.render('error', {error});
        }

    } catch (error) {
        res.render('error', {error});
    }
}

// Gerenciamento de Categorias
    exports.index = async function (req, res){
        try{
            const categories = await Category.getCategories();
            res.render('layouts/admin/category/index', {categories})
        } catch (error) {
            res.render('error', {error});
        }
    }

    exports.store = async function (req, res){
        try{        
            const categories = await Category.getCategories();
            var   category   = await Category.findOne({slug: slugFormatter(req.body.name)}).lean();
            
            // Verifica se já tem uma categoria com o mesmo nome
            if(category){
                formErrorsStore = {name: {error:'Nome já cadastrado', field: req.body.name} };
    
                res.render('layouts/admin/category/index', {categories, formErrorsStore });
            } else {
    
                let formErrorsStore = fieldsValidatorCategory(req.body);
                let haveErros       = Object.keys(formErrorsStore).length != 0;
        
                if(haveErros){
                    res.render('layouts/admin/category/index', {categories, formErrorsStore });
                } else {
                    await Category.create({ name: req.body.name, slug: slugFormatter(req.body.name) });
                    
                    const categories = await Category.getCategories();
                    res.render('layouts/admin/category/index', {categories})
                }
            }
        } catch (error) {
            res.render('error', {error});
        }
    }
    
    exports.update = async function (req, res){
        try{
            let formErrorsUpdate = fieldsValidatorCategory(req.body);
            let haveErros = Object.keys(formErrorsUpdate).length != 0;
            
            if(haveErros){
                const categories = await Category.getCategories();
                const category   = await Category.findOne({_id:req.body.id}).lean();

                res.render('layouts/admin/category/index', {categories, category, formErrorsUpdate});
            } else {
                await Category.updateOne({_id:req.body.id}, { name: req.body.name, slug: slugFormatter(req.body.name)  });

                const categories = await Category.getCategories();
                res.render('layouts/admin/category/index', {categories});
            }

        } catch (error) {
            res.render('error', {error});
        }
    }

    exports.deleteCategory = async function (req, res){
        try{
            await Category.deleteOne({_id: req.body.id});
            await Post.deleteMany({category: req.body.id});

            const categories = await Category.getCategories();
            res.render('layouts/admin/category/index', {categories})
        } catch (error) {
            res.render('error', {error});
        }
    }

    function fieldsValidatorCategory(fields){
        let formErrors     = [];
        let requiredFields = ['name']

        for(requiredField of requiredFields) {
            if(!fields[requiredField] || typeof fields[requiredField] == undefined || fields[requiredField] == null || fields[requiredField].length < 5){
                formErrors[requiredField] = {error: 'Campo inválido', field: fields[requiredField]};
            }
        }

        return arrayToObject(formErrors);
    }