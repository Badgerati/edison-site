// libs
var express = require('express');


// express router
var router = express.Router();


module.exports = function() {

    // get a run with passed ID
    router.get('/alive', (req, res) => {
        res.json({ error: false });
    });


    return router;
}