require('../models/Category');
require('../models/Post');
require("../models/User");
const mongoose      = require("mongoose");
const passport      = require("passport");
const Category      = mongoose.model('categories');
const Post          = mongoose.model('posts');
const arrayToObject = require('../helpers/arrayToObject');

exports.login = async function (req, res, next) {
    try {
        var formErrors = fieldsValidatorLogin(req.body);
        let haveErrors = Object.keys(formErrors).length != 0;

        if(haveErrors){
            let sortQuery = {name: 'asc'};

            const posts      = await Post.find({status: 'aprovado'}).populate('category').sort({date:'desc'}).lean();
            const categories = await Category.getCategories(sortQuery);
            
            res.render('index', { posts, categories, formErrors })
        } else {
            passport.authenticate("local",
                {
                    successRedirect: "/",
                    failureRedirect: "/",
                    failureFlash: true
                }
            )(req, res, next);
        }
    } catch (error) {
        res.render('error', {error});
    }
}

exports.logout = function (req, res) {
    req.logout();
    res.redirect("/");
}

function fieldsValidatorLogin(fields){
    let formErrors     = [];
    let requiredFields = ['email', 'password']

    for(requiredField of requiredFields) {
        if(!fields[requiredField] || typeof fields[requiredField] == undefined || fields[requiredField] == null){
            formErrors[requiredField] = true;
        }
    }

    return arrayToObject(formErrors);
}
