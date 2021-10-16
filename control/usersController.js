require("../models/User");
const mongoose      = require("mongoose");
const bcrypt        = require("bcryptjs");
const User          = mongoose.model("users");
const arrayToObject = require('../helpers/arrayToObject');

exports.index = async function(req, res) {
    try {
        const users = await User.find().sort({name:'desc'}).lean();
        res.render('layouts/admin/user/index', {users});
    } catch (error) {
        res.render('error', {error});
    }
}

exports.create = async function (req, res) {
    try {
        res.render('layouts/admin/user/create');
    } catch (error) {
        res.render('error', {error});
    }
}

exports.store = async function (req, res) {
    try {
        let requiredFields = ['user_id', 'name', 'surname', 'user_name', 'email', 'password', 'password_confirmation'];
        let formErrors     = fieldsValidatorRegistry(req.body, requiredFields);
        let haveErros      = Object.keys(formErrors).length != 0;
    
        if(haveErros){
            res.render('layouts/admin/user/create', {formErrors});
        } else {
            const findEmail    = await User.findOne({email: req.body.email}).lean();
            const findUserName = await User.findOne({user_name: req.body.user_name}).lean();
    
            if(findEmail || findUserName){
                if(findEmail){
                    formErrors = {email: {error:'E-Mail já cadastrado', field: req.body.email} };
                }
                if(findEmail){
                    formErrors = {user_name: {error:'Usuário já cadastrado', field: req.body.user_name} };
                }
    
                res.render('layouts/admin/user/create', {formErrors});
            } else {
                var hashPwd = await bcrypt.hash(req.body.password,10);

                const newUser = new User({
                    name     : req.body.name,
                    surname  : req.body.surname,
                    user_name: req.body.user_name,
                    email    : req.body.email,
                    password : hashPwd,
                    eAdmin   : true,
                    eOwner   : false
                });

                await User.create(newUser);

                const users = await User.find().sort({name:'desc'}).lean();
                res.render('layouts/admin/user/index', {users});
            }
        }
    } catch (error) {
        res.render('error', {error});
    }
}

exports.edit = async function (req, res) {
    try {
        var user = await User.findOne({_id: req.params.id}).lean();
        
        if(user){
            res.render('layouts/admin/user/update', { user })
        } else {
            res.render('error', {error});
        }

    } catch (error) {
        res.render('error', {error});
    }
}

exports.update = async function (req, res) {
    try{
        const user = await User.findOne({_id: req.body.user_id}).lean();

        let requiredFields = ['user_id', 'name', 'surname', 'user_name', 'email'];
        let formErrors     = fieldsValidatorRegistry(req.body, requiredFields);
        let haveErros      = Object.keys(formErrors).length != 0;

        if(haveErros){
            res.render('layouts/admin/user/update', {user, formErrors});
        } else {
            const updateUser = {
                name     : req.body.name,
                surname  : req.body.surname,
                user_name: req.body.user_name,
                email    : req.body.email
            };

            await User.updateOne({_id:req.body.user_id}, updateUser);

            const users = await User.find().sort({name:'desc'}).lean();
            res.render('layouts/admin/user/index', {users});
        }

    } catch (error) {
        res.render('error', {error});
    }
}

exports.delete = async function (req, res) {
    try {
        const user = await User.findOne({_id:req.body.id});

        if(user.eOwner){
            req.flash('error_msg', 'Não é possível excluir o proprietario!');
        } else {
            await User.deleteOne({_id: req.body.id});
        }

        const users = await User.find().sort({name:'desc'}).lean();
        res.render('layouts/admin/user/index', {users});

    } catch (error) {
        res.render('error', {error});
    }
}

exports.blockUser = async function(req, res) {
    try {
        const user = await User.findOne({_id:req.body.id});

        if(!user.eOwner){
            await User.updateOne({_id:req.body.id}, {eBlocked: req.body.eBlocked});

            const users = await User.find().sort({name:'desc'}).lean();
            res.render('layouts/admin/user/index', {users});
        } else {
            req.flash('error_msg', 'Não é possível bloquear o proprietario!');

            const users = await User.find().sort({name:'desc'}).lean();
            res.render('layouts/admin/user/index', {users});
        }

    } catch (error) {
        res.render('error', {error});
    }
}

function fieldsValidatorRegistry (fields, requiredFields){
    let formErrors = [];

    for(requiredField of requiredFields) {
        if(!fields[requiredField] || typeof fields[requiredField] == undefined || fields[requiredField] == null){
            formErrors[requiredField] = {error: 'Campo inválido', field: fields[requiredField]};
        }
    }

    if(fields.password != fields.password_confirmation){
        formErrors['password_confirmation'] = {error: 'As senhas estão diferentes', field: fields['password_confirmation']};
    }

    return arrayToObject(formErrors);
}