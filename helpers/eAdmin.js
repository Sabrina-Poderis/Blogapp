module.exports = {
    eAdmin: function (req, res, next) {
        if (req.isAuthenticated() && req.user.eAdmin == true) {
            return next();
        } else {
            req.flash('error_msg', 'Você precisa ser um Admin!');
            res.redirect('/');
        }
    }
}