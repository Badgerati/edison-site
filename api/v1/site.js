// libs
var express = require('express');


// express router
var router = express.Router();


module.exports = function() {

    // basic endpoint to test if the site is alive
    router.get('/alive', (req, res) => {
        res.json({ error: false });
    });


    return router;
}