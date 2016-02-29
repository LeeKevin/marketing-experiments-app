(function () {
    'use strict';

    var Experiment = require('../models/Experiment'),
        ExperimentRepository = require('../repositories/ExperimentRepository');

    var ExperimentsController = {
        index: function (req, res, next) {

        },
        /**
         * Create or update an existing Experiment.
         * If the request body has `content`, then the experiment's file will also be created/updated.
         *
         * @param req
         * @param res
         * @param next
         */
        update: function (req, res, next) {
            var action_type, parameters = {
                title: req.body.title,
                metric: req.body.metric,
                goal: req.body.goal,
                result: req.body.result,
                author: req.user.id
            };

            action_type = 'created';
            if (req.body.id) {
                parameters._id = req.body.id;
                action_type = 'updated';
            }

            var callback = function (err, experiment) {
                if (err) {
                    return next(err);
                }
                res.status(200).json({
                    message: "Experiment " + action_type + '!',
                    experiment_id: experiment.id
                });
            };

            if (req.body.content) {
                //also save the content
                ExperimentRepository.saveWithContent(parameters, req.body.content, callback);
            } else {
                //Just save the experiment
                ExperimentRepository.saveExperiment(parameters, callback);
            }
        },
        show: function (req, res, next) {

        },
        delete: function (req, res, next) {

        }
    };

    module.exports = ExperimentsController;
})();
