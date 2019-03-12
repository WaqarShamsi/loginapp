const express         = require('express');
const router          = express.Router();
const User = require('./../models/users');
const UserRoute = require('./users');

router.get('/properties/list', checkApiAuthentication, function (req, res) {
    let Properties = require('./../models/properties');

    Properties.find({}, function (err, data) {
        if(err) throw err;
        res.json(data)
    });
});

router.post('/users/signup', async function (req, res) {
    let userStatus = await UserRoute.createAccount(req, res)

    if(userStatus === true) {
        res.json({
            'type': 'Success',
            'msg': 'The account was created successfully and your credentials are mailed to you along with token and authentication.'
        })
    } else {
        res.json(userStatus)
    }
});

async function checkApiAuthentication(req, res, next) {
    let authentication = req.query.authentication;
    let token = req.query.token;
    let userAuth = await User.countDocuments({
        authentication: authentication,
        token: token
    });
    if(userAuth) {
        return next();
    } else {
        res.json({
            'error': 'unauthorized',
            'msg': 'Sorry, you are not allowed to get this data.',
        })
    }
}

module.exports = router