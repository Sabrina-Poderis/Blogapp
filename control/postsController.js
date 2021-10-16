require('../models/Post');
require('../models/Category');
const mongoose        = require('mongoose');
const Post            = mongoose.model('posts');
const Category        = mongoose.model('categories');
const {slugFormatter} = require('../helpers/slugFormatter');
const arrayToObject   = require('../helpers/arrayToObject');

const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,"public/img/posts");
    },
    filename: function(req, file, cb){
        cb(null, require('crypto').randomBytes(32).toString('hex') + path.extname(file.originalname));
    }
});

exports.uploadFile = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        if(file.mimetype != 'image/png' && file.mimetype != 'image/jpeg') {
            req.fileValidationError = 'Formato do arquivo incorreto ' + file.mimetype;
            return cb(null, false);
        }
        if ((file.size / 1024 / 1024) >  5) {
            req.fileValidationError = 'O limite do arquivo é 5MB';
            return cb(null, false);
        }

        cb(null, true);
    }
}).single("img");

//Mostra Postagens
    exports.show = async function (req, res) {        
        try {
            const post       = await Post.findOne({slug: req.params.slug}).populate('category').lean();
            const categories = await Category.getCategories();
           
            res.render('layouts/post/show', { post, categories })
        } catch (error) {
            res.render('error', {error});
        }
    };

    exports.index = async function (req, res) {       
        try {
            const posts      = await Post.find({status: 'aprovado'}).populate('category').sort({date:'desc'}).lean();
            const categories = await Category.getCategories();
           
            res.render('index', { posts, categories })
        } catch (error) {
            res.render('error', {error});
        }
    }

    exports.list = async function (req, res) {
        try {
            const posts      = await Post.find({status: 'aprovado'}).populate('category').sort({date:'desc'}).lean();
            const categories = await Category.getCategories();
           
            res.render('layouts/post/list', { posts, categories })
        } catch (error) {
            res.render('error', {error});
        }
    }

//Gerenciamento de Postagens
    exports.indexAdmin = async function  (req, res) {
        try{
            const posts = await Post.find().sort({name:'desc'}).populate('category').populate('user').lean();
            res.render('layouts/admin/post/index', {posts})

        } catch (error) {
            res.render('error', {error});
        }
    }

    function fieldsValidatorPost(fields){
        let formErrors     = [];
        let requiredFields = ['user_id', 'title', 'category', 'description', 'content']

        for(requiredField of requiredFields) {
            if(!fields[requiredField] || typeof fields[requiredField] == undefined || fields[requiredField] == null || fields[requiredField].length < 2){
                formErrors[requiredField] = {error: 'Campo inválido', field: fields[requiredField]};
            }
        }

        return arrayToObject(formErrors);
    }

    exports.create = async function (req, res) {
        try {
            const categories = await Category.getCategories();
           
            res.render('layouts/admin/post/create', { categories })
        } catch (error) {
            res.render('error', {error});
        }
    }

    exports.store = async function (req, res) {
        try{
                        
            const categories = await Category.getCategories();
            var   post       = await Post.findOne({slug: slugFormatter(req.body.title)}).lean();
            
            // Verifica se já tem um post com o mesmo nome
            if(post){
                formErrors = {title: {error:'Título já cadastrado', field: req.body.title} };
                res.render('layouts/admin/post/create', {categories, formErrors });
            } else {
                let formErrors = fieldsValidatorPost(req.body);
                if(req.fileValidationError != undefined){
                    formErrors['img'] = {error: fileValidationError, field: ''};
                }

                let haveErros  = Object.keys(formErrors).length != 0;
        
                if(haveErros){
                    res.render('layouts/admin/post/create', {categories, formErrors});
                } else {
                    const newPost = {
                        title       : req.body.title,
                        slug        : slugFormatter(req.body.title),
                        description : req.body.description,
                        content     : req.body.content,
                        category    : req.body.category,
                        user        : req.body.user_id,
                        img         : req.file != undefined ? req.file.filename : 'default.png',
                        status      : 'aprovado'
                    };

                    await Post.create(newPost);
    
                    const posts = await Post.find().sort({name:'desc'}).populate('category').populate('user').lean();
                    res.render('layouts/admin/post/index', {posts})
                }
            }
        } catch (error) {
            console.log(error);
            res.render('error', {error});
        }
    }

    exports.edit = async function (req, res) {
        try {
                        
            const categories = await Category.getCategories();
            var   post       = await Post.findOne({_id: req.params.id}).lean().populate('category');
            
            if(post){
                res.render('layouts/admin/post/update', { categories, post })
            }

        } catch (error) {
            res.render('error', {error});
        }
    }

    exports.update = async function (req, res) {
        try{         
            const categories = await Category.getCategories();
            const post       = await Post.findOne({_id: req.body.post_id}).lean().populate('category');

            let formErrors = fieldsValidatorPost(req.body);
            if(req.fileValidationError != undefined){
                formErrors['img'] = {error: fileValidationError, field: ''};
            }
            let haveErros = Object.keys(formErrors).length != 0;

            if(haveErros){
                res.render('layouts/admin/post/update', {categories, post, formErrors});
            } else {
                const updatePost = {
                    title       : req.body.title,
                    slug        : slugFormatter(req.body.title),
                    description : req.body.description,
                    content     : req.body.content,
                    category    : req.body.category,
                    user        : req.body.user_id,
                    img         : req.file != undefined ? req.file.filename : post.img,
                    status      : 'aprovado'
                };

                await Post.updateOne({_id:req.body.post_id}, updatePost);

                const posts = await Post.find().sort({name:'desc'}).populate('category').populate('user').lean();
                res.render('layouts/admin/post/index', {posts})
            }

        } catch (error) {
            res.render('error', {error});
        }
    }

    exports.delete = async function (req, res) { 
        try{
            await Post.deleteOne({_id: req.body.id})

            const posts = await Post.find().sort({name:'desc'}).populate('category').populate('user').lean();
            res.render('layouts/admin/post/index', {posts});
        } catch (error) {
            res.render('error', {error});
        }
    }