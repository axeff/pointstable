var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    res.render('input');
});


router.post('/', function (req, res) {
    res.render('input', { name: req.body.name });
});


module.exports = router;
