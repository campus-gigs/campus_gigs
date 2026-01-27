module.exports = function (req, res, next) {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied: Super Admin only' });
    }
};
