module.exports = {
    eAdmin: function (req, res, next) {
        if (req.isAuthenticated() && req.user.tipoUsuario == 'admin') {
            return next();
        } else {
            req.flash('error_msg', 'Você precisa ser um Admin!');
            res.redirect('/');
        }
    }
}