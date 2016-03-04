(function () {
    'use strict';

    var Experiment = require('../models/Experiment'),
        ExperimentRepository = require('../repositories/ExperimentRepository'),
        Util = require('../util/util');

    var ExperimentsController = {
        /**
         * Retrieve a list of experiments. The request query is passed in as search parameters.
         *
         * @param req
         * @param res
         * @param next
         */
        index: function (req, res, next) {
            ExperimentRepository.getExperiments(req.query, function (err, experiments) {
                if (err) {
                    return next(err);
                }

                var response = [];
                for (var i = 0, experiment = experiments[i]; i < experiments.length; i++) {
                    response.push({
                        experiment_id: experiment.id,
                        title: experiment.title,
                        metric: experiment.metric,
                        goal: experiment.goal,
                        result: experiment.result,
                        author: {
                            user_id: experiment.author.id,
                            name: experiment.author.name,
                            username: experiment.author.username
                        },
                        content: {
                            id: experiment.file_id,
                            url: Util.trim(req.originalUrl, '/') + '/' + experiment.id + '/content'
                        },
                        createdAt: experiment.createdAt
                    });
                }

                res.status(200).json(response);
            });
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
        /**
         * Retrieve experiment details.
         * The content of the experiment will contain the id of the file and the url to read the file.
         *
         * @param req
         * @param res
         * @param id
         * @param next
         */
        show: function (req, res, id, next) {
            ExperimentRepository.getExperiment(id, function (err, experiment) {
                if (err) {
                    return next(err);
                }

                res.status(200).json({
                    experiment_id: experiment.id,
                    title: experiment.title,
                    metric: experiment.metric,
                    goal: experiment.goal,
                    result: experiment.result,
                    author: {
                        user_id: experiment.author.id,
                        name: experiment.author.name,
                        username: experiment.author.username
                    },
                    content: {
                        id: experiment.file_id,
                        url: Util.trim(req.originalUrl, '/') + '/content'
                    }
                });
            });
        },
        /**
         * Delete an experiment.
         *
         * @param req
         * @param res
         * @param id
         * @param next
         */
        delete: function (req, res, id, next) {
            ExperimentRepository.deleteExperiment(id, function (err) {
                if (err) {
                    return next(err);
                }

                res.status(200).json({
                    message: 'Experiment deleted!'
                });
            });
        }
    };

    module.exports = ExperimentsController;
})();
