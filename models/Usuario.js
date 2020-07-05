const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const Usuario = new Schema({
    nome:{
        type: String,
        required: true
    },
    sobrenome:{
        type: String,
        required: true
    },
    nome_usuario:{
        type: String,
        required: true
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
        required: true
    },
    eBloq:{
        type: Boolean
    }
});

mongoose.model("usuarios", Usuario);