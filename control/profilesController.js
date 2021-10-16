require("../models/User");
const mongoose      = require("mongoose");
const bcrypt        = require("bcryptjs");
const User          = mongoose.model("users");
const arrayToObject = require('../helpers/arrayToObject');

function fieldsValidatorProfile (fields){
    let formErrors     = [];
    let requiredFields = ['user_id','name', 'surname', 'user_name', 'email'];

    for(requiredField of requiredFields) {
        if(!fields[requiredField] || typeof fields[requiredField] == undefined || fields[requiredField] == null){
            formErrors[requiredField] = {error: 'Campo inválido', field: fields[requiredField]};
        }
    }

    return arrayToObject(formErrors);
}

function fieldsValidatorPassword (fields){
    let formErrors = [];
    let requiredFields = ['user_id','new_password','password_confirmation'];

    for(requiredField of requiredFields) {
        if(!fields[requiredField] || typeof fields[requiredField] == undefined || fields[requiredField] == null){
            formErrors[requiredField] = {error: 'Campo inválido', field: fields[requiredField]};
        }

        if(fields[requiredField].length < 6){
            formErrors[requiredField] = {error: 'Este campo deve ter 5 dígitos', field: fields[requiredField]};
        }
    }
    
    if(fields.new_password != fields.password_confirmation){
        formErrors['password_confirmation'] = {error: 'As senhas estão diferentes', field: fields['password_confirmation']};
    }

    return arrayToObject(formErrors);
}

exports.updateUser = async function(req, res) {
    try{
        let formErrors = fieldsValidatorProfile(req.body);
        let haveErros  = Object.keys(formErrors).length != 0;

        if(haveErros){
            res.redirect('/');
        } else {
            const update = {
                name     : req.body.name,
                surname  : req.body.surname,
                user_name: req.body.user_name,
                email    : req.body.email
            };

            await User.updateOne({_id:req.body.user_id}, update);

            res.redirect('/');
        }

    } catch (error) {
        res.render('error', {error});
    }
}

exports.updatePassword = async function(req, res){
    try{
        let formErrors = fieldsValidatorPassword(req.body);
        let haveErros  = Object.keys(formErrors).length != 0;

        if(haveErros){
            res.redirect('/');
        } else {

            var hashPwd = await bcrypt.hash(req.body.new_password,10);
            await User.updateOne({_id:req.body.user_id}, {password: hashPwd});
            
            res.redirect('/');
        }
    } catch (error) {
        res.render('error', {error});
    }

}