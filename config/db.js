if (process.env.NODE_ENV == "production") {
    module.exports = {
        mongoURI: "mongodb+srv:[...]"
    }
} else {
    module.exports = { mongoURI: "mongodb://localhost/blogapp" }
}