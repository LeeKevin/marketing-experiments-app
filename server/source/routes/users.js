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
        Route.get('/:id', function (req, res) {
            var id = req.params.id;
            UsersController.show(req, res, id);
        });
        Route.put('/:id', function (req, res) {
            var id = req.params.id;
            UsersController.update(req, res, id);
        });
        Route.delete('/:id', function (req, res) {
            var id = req.params.id;
            UsersController.delete(req, res, id);
        });

        app.use('/api/users', Route);
    };
})();
