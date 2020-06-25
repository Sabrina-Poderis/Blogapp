module.exports = {
    eAdmin: function (req, res, next) {
        if (req.isAuthenticated() && req.user.eAdmin == 'admin') {
            return next();
        }
        req.flash('error_msg', 'Você precisa ser um Admin!');
        res.redirect('/');
    }
}