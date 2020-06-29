module.exports = {
    userAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            req.flash('error_msg', 'Você precisa estar logado!');
            res.redirect('/');
        }
    }
}