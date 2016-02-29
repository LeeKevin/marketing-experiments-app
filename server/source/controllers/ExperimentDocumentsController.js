(function () {
    'use strict';

    var Experiment = require('../models/Experiment'),
        ExperimentRepository = require('../repositories/ExperimentRepository'),
        GenericError = require('../errors/GenericError');

    var ExperimentDocumentsController = {
        /**
         * Update the content for an Experiment.
         *
         * POST/PUT api/experiments/{experiment_id}/content
         *
         * @param req
         * @param res
         * @param experiment_id
         * @param next
         */
        update: function (req, res, experiment_id, next) {
            if (!experiment_id) {
                return next(new GenericError('Bad request', 400, 'You must provide a valid experiment_id'));
            }

            Experiment.findOne({'_id': experiment_id}, function (err, experiment) {
                if (err) {
                    return next(err);
                }

                ExperimentRepository.saveExperimentDocument(experiment.file_id, req.body, function (err, file) {
                    if (err) {
                        return next(err);
                    }

                    res.status(200).json({
                        message: "Experiment updated!",
                        experiment_id: experiment.id,
                        file_id: file._id
                    });
                });
            });
        },
        show: function (req, res, experiment_id, next) {
            if (!experiment_id) {
                return next(new GenericError('Bad request', 400, 'You must provide a valid experiment_id'));
            }

            Experiment.findOne({'_id': experiment_id}, function (err, experiment) {
                if (err) {
                    return next(err);
                }

                ExperimentRepository.getExperimentDocument(experiment.file_id, res);
            });
        }
    };

    module.exports = ExperimentDocumentsController;
})();
