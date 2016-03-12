(function () {
    'use strict';

    /**
     * Create an instance of the app, and pass it to the app bootstrap.
     */

    var express = require('express'),
        config = require('./config/app'),
        auth = require('./config/auth'),
        database = require('./config/database'),
        mongoose = require('mongoose'),
        Grid = require('gridfs-stream'),
        app = express(),
        db;

    mongoose.connect('mongodb://' + database["host"] + (database["port"] ? ':' + database["port"] : '') + '/' + database["db"]);

    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        Grid.mongo = mongoose.mongo;
        app.set('gridfs', Grid(db.db));
        app.set('auth', auth);

        require("./source/bootstrap")(app);
        var listener = app.listen(config['port'] || 5000, function () {
            console.log('Listening on port ' + listener.address().port);
        });
    });
})();
