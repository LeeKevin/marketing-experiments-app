(function () {
    'use strict';

    var Route = require('express').Router();

    var UsersController = require('../controllers/UsersController');

    module.exports = function (app) {

        /**
         * Define routes here. You can create other files in this directory
         * which will be automatically loaded into the application.
         * Be sure to copy the basic structure of this file.
         */

        Route.get('/', UsersController.index);
        Route.post('/', UsersController.create);
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
