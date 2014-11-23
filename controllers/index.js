var express = require('express');
var router = express.Router();

module.exports.controller = function(app) {

    /* GET home page. */
    router.get('/', function(req, res) {
        res.render('index');
    });

}


module.exports = router;
