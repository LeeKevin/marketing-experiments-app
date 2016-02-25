(function () {
    'use strict';

    var User = require('../models/User');

    var UsersController = {
        index: function (req, res) {
            res.send('Hello world!');
        },
        create: function (req, res, next) {

            var user = new User();
            user.name.first = req.body['firstname'];
            user.name.last = req.body['lastname'];
            user.save(function(err) {
                if (err) {
                    return next(err);
                }

                res.json({ message: 'User created!' });
            });
        },
        show: function (req, res, id) {
            res.send('Hello world!');
        },
        update: function (req, res, id) {
            res.send('Hello world!');
        },
        delete: function (req, res, id) {
            res.send('Hello world!');
        }
    };

    module.exports = UsersController;
})();
