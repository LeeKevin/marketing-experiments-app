(function () {
    'use strict';

    var Route = require('express').Router(),
        UsersController = require('../controllers/UsersController'),
        VerifyToken = require('../middleware/VerifyToken');

    module.exports = function (app) {
        Route.use(VerifyToken);

        /**
         * Define routes here. You can create other files in this directory
         * which will be automatically loaded into the application.
         * Be sure to copy the basic structure of this file.
         */

        Route.get('/', UsersController.me);
        Route.get('/me', UsersController.index);
        Route.get('/:id', function (req, res, next) {
            var id = req.params.id;
            UsersController.show(req, res, id, next);
        });
        Route.put('/:id', function (req, res, next) {
            var id = req.params.id;
            UsersController.update(req, res, id, next);
        });
        Route.delete('/:id', function (req, res, next) {
            var id = req.params.id;
            UsersController.delete(req, res, id, next);
        });

        app.use('/api/users', Route);
    };
})();
