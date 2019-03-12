var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    authentication: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        required: true
    },
    updatedAt: {
        type: String,
        required: true
    }
});

var User = module.exports = mongoose.model('users', UserSchema);

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        if(err) throw err;
        bcrypt.hash(newUser.password, salt, function (err, hash) {
           newUser.password = hash;
           newUser.save(callback);
        });
    });
};

module.exports.getUserByEmail = function (email, callback) {
    var query = {email:email};
    User.findOne(query, callback);
}

module.exports.getUserById = function (id, callback) {
        User.findById(id, callback);
}

module.exports.comparePassword = function (password, hash, callback) {
    bcrypt.compare(password, hash, function (err, isMatch) {
       //if(err) throw err;
       callback(null, isMatch);
    });
}
