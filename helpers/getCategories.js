require('../models/Category');

const mongoose = require('mongoose');
const Category = mongoose.model('categories');

module.exports = 
function getCategories () {
    Category.find().sort({name:'asc'}).lean().then((categories) => {
        return categories;
    }).catch(() =>{
        return null;
    })
}