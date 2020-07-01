if (process.env.NODE_ENV == "production") {
    module.exports = {
        mongoURI: "mongodb+srv://varphy:eatgGwACkT61ExIb@blogapp-prod-i4pfd.mongodb.net/blogapp-prod?retryWrites=true&w=majority"
    }
} else {
    module.exports = { mongoURI: "mongodb://localhost/blogapp" }
}