'use strict';

try {
    /////////////////////////////////////
    // config
    /////////////////////////////////////
    var config = require('./config.js');


    /////////////////////////////////////
    // load required libraries
    /////////////////////////////////////
    var http = require('http');
    var express = require('express');
    var bodyParser = require('body-parser');
    var mongoose = require('mongoose');
    var path = require('path');
    var flash = require('connect-flash');
    var lessMiddleware = require('less-middleware');


    /////////////////////////////////////
    // mongo setup
    /////////////////////////////////////
    mongoose.Promise = global.Promise;
    mongoose.connect((process.env.MONGO_CONN || config.mongo.connection), { useMongoClient: true }, (err) => {
        if (err) {
            console.log(err);
            throw err;
        }
        
        console.log('Mongo connected');
    });


    /////////////////////////////////////
    // setup express
    /////////////////////////////////////
    var app = express();
    app.set('port', (process.env.PORT || config.port));

    // body JSON parsing
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // set public path
    var public_path = path.join(__dirname, 'public');

    // compile less
    app.use(lessMiddleware(public_path, {
        dest: public_path,
        force: true,
        preprocess: {
            path: function(pathname, req) {
                var csspath = path.sep + 'css' + path.sep;
                return pathname.replace(csspath, csspath + 'less' + path.sep);
            }
        }
    }));

    app.use(express.static(public_path));

    // flash
    app.use(flash());


    /////////////////////////////////////
    // setup view engine
    /////////////////////////////////////
    app.set('view engine', 'pug');


    /////////////////////////////////////
    // load and setup API
    /////////////////////////////////////
    app.use('/api/v1/runs', require('./api/v1/runs.js')());
    app.use('/api/v1/results', require('./api/v1/results.js')());
    app.use('/api/v1/tests', require('./api/v1/tests.js')());
    app.use('/api/v1/site', require('./api/v1/site.js')());


    /////////////////////////////////////
    // setup page + action routes
    /////////////////////////////////////
    app.use('/', require('./routes/pages.js')());
    app.use('/', require('./routes/actions.js')());


    /////////////////////////////////////
    // catch 404s
    /////////////////////////////////////
    //app.use(function(req, res, next) {
    //    var err = new Error('Not found');
    //    err.status = 404;
    //    next(err);
    //});


    /////////////////////////////////////
    // hook node onto ip:port
    /////////////////////////////////////    
    http.createServer(app).listen(app.get('port'), function() {
        console.log('Running on http://localhost:' + app.get('port'));
    });
}
catch (err) {
    console.log(err);
    throw err;
}