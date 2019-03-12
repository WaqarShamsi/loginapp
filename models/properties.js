var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var propertySchema = mongoose.Schema({
    owner_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    property_image: {
        type: Object,
        required: true
    },
    description: {
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

var Properties = module.exports = mongoose.model('properties', propertySchema);

module.exports.createProperty = function (newProperty, callback) {
    newProperty.save(callback);
};

module.exports.findPersonalProperties = function (query, callback) {
    return Properties.find(query);
};



