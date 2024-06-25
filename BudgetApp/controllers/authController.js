const User = require('../models/user');
const bcrypt = require('bcrypt');

exports.signup = (req, res) => {
    const { email, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: err });
        } else {
            const newUser = new User({ email, password: hash });
            newUser.save()
                .then(() => res.redirect('/auth/login'))
                .catch(err => res.status(500).json({ error: err }));
        }
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/auth/login');
            }
            bcrypt.compare(password, user.password, (err, result) => {
                if (err || !result) {
                    req.flash('error', 'Invalid email or password');
                    return res.redirect('/auth/login');
                }
                req.session.user = user;
                res.redirect('/dashboard');
            });
        })
        .catch(err => res.status(500).json({ error: err }));
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.redirect('/auth/login');
    });
};
