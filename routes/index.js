var express = require('express');
var router = express.Router();

// Get homepage
router.get('/', function (req, res) {
    res.render('index', {defaultlayout: false});
});

module.exports = router;

//pic 500px