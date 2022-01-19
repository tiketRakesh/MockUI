const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

/* router.get('/user/register', (req, res) => {
    res.render('users/register');
}); */

router.post('/user/register', catchAsync(async (req, res, next) => {
    try {
        const { role, username, password } = req.body;
        const user = new User({ role, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            //req.flash('success', 'Welcome to the home page !');
            res.send('user is added successfully');
        })
    } catch (e) {
       // req.flash('error', e.message);
        console.log(e)
        res.send('unable to add user successfully');
    }
}));

router.get('/user/login', (req, res) => {
    res.render('users/login');
})

router.post('/user/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/user/login' }), (req, res) => {
    req.flash('success', 'Logged In Successfully!');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/user/logout', (req, res) => {
    req.logout();
    req.flash('success', "Logged Out Successfully!");
    res.redirect('/');
})

module.exports = router;