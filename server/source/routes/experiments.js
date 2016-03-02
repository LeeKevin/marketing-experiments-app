(function () {
    'use strict';

    var Route = require('express').Router(),
        ExperimentsController = require('../controllers/ExperimentsController'),
        VerifyToken = require('../middleware/VerifyToken');

    module.exports = function (app) {

        Route.get('/', ExperimentsController.index);
        Route.get('/:id', function (req, res, next) {
            var id = req.params.id;
            ExperimentsController.show(req, res, id, next);
        });

        Route.post('/', VerifyToken, ExperimentsController.update);
        Route.put('/:id', VerifyToken, function (req, res, next) {
            req.body.id = req.params.id;
            ExperimentsController.update(req, res, next);
        });
        Route.delete('/:id', VerifyToken, function (req, res, next) {
            var id = req.params.id;
            ExperimentsController.delete(req, res, id, next);
        });

        app.use('/api/experiments', Route);
    };
})();
