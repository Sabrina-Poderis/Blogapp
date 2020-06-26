if (process.env.NODE_ENV == "production") {
    module.exports = {
        mongoURI: "mongodb+srv://varphy:PmtSIi64cSdEcycY@blogapp-prod-i4pfd.mongodb.net/blogapp?retryWrites=true&w=majority"
    }
} else {
    module.exports = { mongoURI: "mongodb://localhost/blogapp" }

}