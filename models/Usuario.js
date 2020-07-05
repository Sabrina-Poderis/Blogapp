const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const Usuario = new Schema({
    nome:{
        type: String,
        required: true
    },
    sobrenome:{
        type: String
    },
    nome_usuario:{
        type: String
    },
    email:{
        type: String,
        required: true
    },
    senha:{
        type: String,
        required: true
    },
    eAdmin:{
        type: Boolean,
        required: true
    },
    eDono:{
        type: Boolean,
    }
});

mongoose.model("usuarios", Usuario);