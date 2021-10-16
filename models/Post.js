const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const Post = new Schema({
    title:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    category:{
        type: Schema.Types.ObjectId,
        ref: "categories",
        required: true
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    date:{
        type: Date,
        default: Date.now()
    },
    status:{
        type: String,
        required: true
    },
    img:{
        type: String,
        default: 'default.png'
    }
});

mongoose.model("posts", Post);