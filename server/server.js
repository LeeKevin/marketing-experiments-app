(function () {
    'use strict';

    /**
     * Create an instance of the app, and pass it to the app bootstrap.
     */

    var express = require('express'),
        config = require('./config/app'),
        database = require('./config/database'),
        mongoose = require('mongoose'),
        app = express();

    mongoose.connect('mongodb://' + database["host"] + (database["port"] ? ':' + database["port"] : '') + '/' + database["db"]);

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        app.set('auth', config['auth']);

        require("./source/bootstrap")(app);
        var listener = app.listen(config['port'] || 5000, function () {
            console.log('Listening on port ' + listener.address().port);
        });
    });
})();
