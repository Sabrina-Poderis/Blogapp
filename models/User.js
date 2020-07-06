const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const User = new Schema({
    name:{
        type: String,
        required: true
    },
    surname:{
        type: String,
        required: true
    },
    user_name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    eAdmin:{
        type: Boolean,
        required: true
    },
    eOwner:{
        type: Boolean,
        required: true
    },
    eBlocked:{
        type: Boolean
    }
});

mongoose.model("users", User);