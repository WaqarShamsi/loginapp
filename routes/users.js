var express         = require('express');
var router          = express.Router();
var passport        = require('passport');
var bcrypt          = require('bcryptjs');
var expressLocal    = require('passport-local').Strategy;

var User = require('./../models/users');
var errorsLibrary = require('./../library/errors');

router.get('/register', function (req, res) {
    res.render('register', {layout: false});
});

router.get('/update-password', ensureAuthentication, function (req, res) {
    res.render('update-password', {layout: false});
});

router.post('/update-password', ensureAuthentication, function (req, res) {

    var email = req.user.email;
    var password = req.body.new_password;

    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('new_password', 'New password is required').notEmpty();
    req.checkBody('repeat', 'Repeat password is required').notEmpty();

    var errors = req.validationErrors();

    if (req.body.repeat !== req.body.new_password) {
        if(errors === false) errors = [];
        let error_msg = errorsLibrary.getError('PAE0001', false).error_message;
        let passwordError = {param: 'repeat', msg: error_msg, value: ''};
        errors.push(passwordError);
    }

    if(errors) {
        res.render('update-password', {errors: errors, layout: false});
    }

    User.findOne({"email": email}, async function (err, data) {

        if(err) throw err;

        var salt = await bcrypt.genSalt(10);
        var hash = await bcrypt.hash(password, salt);

        data.password = hash;

        data.save(function (err, updateData) {

            console.log("====================")
            console.log(updateData)
            console.log("====================")

            req.user.password = hash;

            res.render('update-password', {layout: false, success_msg: 'Password was updated successfully.'});
        })
    })
});

router.post('/register', async function (req, res) {

    try{
        var accountStatus = await createAccount(req, res);
        if(accountStatus !== true) throw 'Could not signup properly';
        res.render('login', {layout: false, success_msg: 'You have signup successfully'})
    }
    catch (e) {
        console.log(e)
        res.render('register', accountStatus)
    }

});

router.get('/login', function (req, res) {
    res.render('login', {layout: false});
});

passport.use(new expressLocal({
        usernameField: 'email',
        passwordField: 'password',
    },
    function(username, password, done) {
      User.getUserByEmail(username, function (err, user) {
          if(err) throw err;
          if(!user) {
              return done(null, false, {message: 'Unknown user'});
          }

          User.comparePassword(password, user.password, function (err, isMatch) {
              if(err) throw err;
              if(isMatch) {
                  return done(null, user);
              } else {
                  return done(null, false, {message: 'Invalid credentials'});
              }
          });
      });

    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', {successRedirect:'/', failureRedirect: '/users/login', failureFlash: true}),
    function(req, res) {
        res.redirect('/');
    });

router.get('/logout', function (req, res) {
   req.logout();
   req.flash('success_msg', 'You are successfully logged out.');
   res.render('login');
});

async function genApiAuth() {
    let authentication = 'AuthCode'+Math.floor(100000 + Math.random() * 900000);
    let token = Math.floor(100000 + Math.random() * 900000);
    let authCount = await User.countDocuments({authentication: authentication});
    let tokenCount = await User.countDocuments({token: token});

    if(authCount || tokenCount) {
        return await genApiAuth()
    }
    return {
        authentication: authentication,
        token: token
    }
}

let createAccount = module.exports = async (req, res) => {

    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();

    var errors = req.validationErrors();

    if (req.body.repeat !== req.body.password) {
        if(errors === false) errors = [];
        let error_msg = errorsLibrary.getError('PAE0001', false).error_message;
        let passwordError = {param: 'repeat', msg: error_msg, value: ''};
        errors.push(passwordError);
    }

    let emailCount = await User.countDocuments({email: email});
    if(emailCount) {
        if(errors === false) errors = [];
        let error_msg = errorsLibrary.getError('PAE0002', false).error_message;
        let emailError = {param: 'repeat', msg: error_msg, value: ''};
        errors.push(emailError);
    }

    if(errors) {
        let data = {layout: false, errors:errors, name: req.body.name, email: req.body.email};
        return data;
    }

    let sourceUrl = req.baseUrl;
    let userAuthentication = await genApiAuth()

    let now = new Date();
    let newUser = new User({
        name: req.body.name,
        email: email,
        password: req.body.password,
        authentication: userAuthentication.authentication,
        token: userAuthentication.token,
        source: sourceUrl,
        createdAt: now,
        updatedAt: now
    });

    await User.createUser(newUser, function (err, user) {
        if(err) throw err;
    });

    return true
}

function ensureAuthentication(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'Sorry, You are not allowed to see that page, login first or signup.');
        res.redirect('/users/login')
    }
}

module.exports = {
    router: router,
    createAccount: createAccount
}
