(function () {
    'use strict';

    var Route = require('express').Router(),
        ExperimentDocumentsController = require('../controllers/ExperimentDocumentsController'),
        VerifyToken = require('../middleware/VerifyToken');

    module.exports = function (app) {
        Route.get('/:experiment_id/content', function (req, res, next) {
            var id = req.params.experiment_id;
            ExperimentDocumentsController.show(req, res, id, next);
        });


        /**
         * Our POST and PUT are the same since the experiment must already exist to access this set of endpoints.
         * It doesn't make sense to be able to create/delete the Document separately from the Experiment record.
         */
        Route.post('/:experiment_id/content', VerifyToken, function (req, res, next) {
            var experiment_id = req.params.experiment_id;
            ExperimentDocumentsController.update(req, res, experiment_id, next);
        });
        Route.put('/:experiment_id/content', VerifyToken, function (req, res, next) {
            var experiment_id = req.params.experiment_id;
            ExperimentDocumentsController.update(req, res, experiment_id, next);
        });

        app.use('/api/experiments', Route);
    };
})();
