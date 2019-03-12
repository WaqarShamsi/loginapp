var express = require('express');
var router = express.Router();

var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/property_images')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

var upload = multer({ storage: storage })

var Properties = require('./../models/properties');

router.get('/peer-support', ensureAuthentication, function (req, res) {
    res.render('chat', {layout: false, name: req.user.name});
});
router.get('/address-check', function (req, res) {
    res.render('property/address', {layout: false});
});

router.get('/add', ensureAuthentication, function (req, res) {
    res.render('property/add', {layout: false});
});

router.post('/add', upload.array('images', 10), function (req, res, next) {
    // res.render('property/add', {layout: false});
    let name = req.body.name;
    let location = req.body.location;
    let description = req.body.description;
    const filesAllowed = ["jpg", "jpeg", "png"];

    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('location', 'Loction is required').notEmpty();
    req.checkBody('description', 'Please enter some description').notEmpty();

    var errors = req.validationErrors();

    var files = [];
    if (req.files.length > 0) {
        for (var i = 0; i < req.files.length; i++) {
            if(!filesAllowed.includes(req.files[i].filename.split('.')[1])) {
                if(errors === false) {
                    errors = [];
                    // Please, fix the file type...
                    let fileTypeError = {param: 'file', msg: 'We do not allow '+ imageType + ' Files', value: ''};
                    errors.push(fileTypeError);
                }
                break;
            }

            var fileDetails = {
                'count': i,
                'filename': req.files[i].filename,
                'originalname': req.files[i].originalname,
            };
            files.push(fileDetails);
        }
    }

    if(errors) {
        //res.send(JSON.stringify(errors));
        var data = {layout: false, errors:errors, name: req.body.name, location: req.body.location, description: req.body.description};
        res.render('property/add', data);
    } else {

        if(!req.user._id) res.redirect('users/logout');
        var now = new Date();
        var newProperty = new Properties({
            owner_id: req.user._id,
            name: name,
            location: location,
            property_image: files,
            description: description,
            createdAt: now,
            updatedAt: now
        });
        Properties.createProperty(newProperty, function (err, property) {
            if(err) throw err;
        });

        req.flash('success_msg', 'You have entered your property successfully.');
        res.redirect('/property/assets');
        next();
    }
});

router.get('/assets', ensureAuthentication, function (req, res) {

    Properties.countDocuments({owner_id: req.user._id}, function (err, count) {
        if(err) throw err;
        if(count<1){
            res.render('property/assets', {layout: false});
        } else {
            var skip = (4 * req.query.page) - 4;
            var totalPages = Math.ceil(count / 4);
            var pages = [];
            for (var p = 1; p <= totalPages; p++) {
                pages.push(p);
            }
            Properties.find({owner_id: req.user._id}, function (err, personalProperties) {
                if(err) throw err;
                res.render('property/assets', {personalProperties: personalProperties, layout: false, pages: pages});
            }).skip(skip).limit(4).sort({'updatedAt':-1});
        }
    });
});

router.get('/listing', function (req, res) {
    Properties.countDocuments({}, function (err, count) {
        if(err) throw err;
        if(count<1){
            console.log('No properties to display.');
        } else {
            let page = req.query.page;
            var skip = (4 * page) - 4;
            var totalPages = Math.ceil(count / 4);
            var pages = [];
            for (var p = 1; p <= totalPages; p++) {
                pages.push(p);
            }
            Properties.find({}, function (err, allProperties) {
                if(err) throw err;
                res.render('property/listing', {allProperties: allProperties, layout: false, pages: pages, page: page});
            }).skip(skip).limit(4).sort({'updatedAt':-1});
        }
    });
});

function ensureAuthentication(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'Sorry, You are not allowed to see that page, login first or signup.');
        res.redirect('/users/login')
    }
}

module.exports = router;