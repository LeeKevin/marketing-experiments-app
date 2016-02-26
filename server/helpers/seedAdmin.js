(function () {
    'use strict';

    var database = require('../config/database'),
        mongoose = require('mongoose'),
        admin = require('../config/admin'),
        User = require('../source/models/User')
        ;

    var db;
    mongoose.connect('mongodb://' + database["host"] + (database["port"] ? ':' + database["port"] : '') + '/' + database["db"]);

    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        (new User(admin)).save(function (err, user) {
            if (err) {
                throw err;
            }

            console.log('User (' + user.username + ') created: id ' + user.id);

            process.exit();
        });
    });
})();
