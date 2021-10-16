const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const Category = new Schema({
    name:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now()
    },
});

Category.statics.getCategories = function() {
    return new Promise((resolve, reject) => {
        this.find((error, categories) =>{
            if(error){
                console.error(error);
                return reject(error);
            }
            resolve(categories);
        }).sort({name: 'asc'}).lean()
    })
};

mongoose.model("categories", Category);