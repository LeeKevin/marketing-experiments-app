(function () {
    'use strict';

    var Route = require('express').Router(),
        ExperimentsController = require('../controllers/ExperimentsController'),
        VerifyToken = require('../middleware/VerifyToken');

    module.exports = function (app) {
        Route.use(VerifyToken);

        Route.get('/', ExperimentsController.index);
        Route.post('/', ExperimentsController.update);
        Route.get('/:id', function (req, res, next) {
            var id = req.params.id;
            ExperimentsController.show(req, res, id, next);
        });
        Route.put('/:id', function (req, res, next) {
            req.body.id = req.params.id;
            ExperimentsController.update(req, res, next);
        });
        Route.delete('/:id', function (req, res, next) {
            var id = req.params.id;
            ExperimentsController.delete(req, res, id, next);
        });

        app.use('/api/experiments', Route);
    };
})();
