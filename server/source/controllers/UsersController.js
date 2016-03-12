(function () {
    'use strict';

    var User = require('../models/User');

    var UsersController = {
        index: function (req, res, next) {
            User.find(function (err, users) {
                if (err) {
                    return next(err);
                }

                var usersArray = [];
                for (var i = 0; i < users.length; i++) {
                    usersArray.push({
                        'user_id': users[i].id,
                        'name': users[i].name,
                        'username': users[i].username,
                        'email': users[i].email,
                    });
                }

                res.status(200).json(usersArray);
            });
        },
        show: function (req, res, id, next) {
            User.findOne({'_id': id}, function (err, user) {
                if (err) {
                    return next(err);
                }

                res.status(200).json({
                    'user_id': user.id,
                    'name': user.name,
                    'username': user.username,
                    'email': user.email,
                });
            });
        },
        update: function (req, res, id, next) {
            User.findOne({'_id': id}, function (err, user) {
                if (err) {
                    return next(err);
                }

                if (req.body['name']) user.name = req.body['name'];
                if (req.body['username']) user.username = req.body['username'];
                if (req.body['email']) user.email = req.body['email'];

                user.save(function (err, user) {
                    if (err) {
                        return next(err);
                    }

                    res.status(200).json({
                        message: 'User updated!',
                        user_id: user.id
                    });
                });
            });
        },
        delete: function (req, res, id, next) {
            User.remove({'_id': id}, function (err) {
                if (err) {
                    return next(err);
                }

                res.status(200).json({
                    message: 'User deleted!'
                });
            });
        }
    };

    module.exports = UsersController;
})();
