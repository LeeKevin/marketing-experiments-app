(function () {
    'use strict';

    var Experiment = require('../models/Experiment'),
        stream = require('string-to-stream'),
        GenericError = require('../errors/GenericError'),
        Grid = require('gridfs-stream'),
        mongoose = require('mongoose'),
        gridfs = Grid(mongoose.connection.db),
        COLLECTION = 'ExperimentDocuments';

    module.exports = {
        /**
         * Save an experiment. The saved experiment will be returned in the callback.
         * If `parameters` has a `_id` property, then this will update the experiment with that id. If not, this will create
         * a new experiment.
         *
         * @param parameters
         * @param callback
         * @returns {*}
         */
        saveExperiment: function (parameters, callback) {
            if (parameters['_id']) {
                return Experiment.findOne({'_id': parameters['_id']}, function (err, experiment) {
                    if (err) {
                        return callback(err);
                    }
                    return saveExperiment(experiment, parameters, callback);
                });
            } else {
                return saveExperiment(new Experiment(), parameters, callback);
            }
        },
        /**
         * Save the content of an experiment. The saved experiment document file will be returned in the callback.
         *
         * @param id The id of the experiment document to save
         * @param html
         * @param callback
         */
        saveExperimentDocument: function (id, html, callback) {
            var writeStream, options = {
                root: COLLECTION,
                content_type: 'text/html'
            };
            if (id) {
                options._id = id;
            }
            writeStream = gridfs.createWriteStream(options);
            stream(html).pipe(writeStream);

            writeStream.on('finish', function () {
                writeStream.destroy();
            });

            writeStream.on('error', function (err) {
                writeStream.destroy();
                if (typeof callback === 'function' && err) {
                    return callback(err);
                }
            });

            writeStream.on('close', function (file) {
                callback(null, file);
            });
        },
        /**
         * Save an experiment and update its content as the passed in html.
         * If `parameters` has a `_id` property, then this will update the experiment with that id. If not, this will create
         * a new experiment.
         *
         * @param parameters
         * @param html
         * @param callback
         * @returns {*}
         */
        saveWithContent: function (parameters, html, callback) {
            var _this = this;

            if (parameters['_id']) {
                return Experiment.findOne({'_id': parameters['_id']}, function (err, experiment) {
                    if (err) {
                        return callback(err);
                    }

                    _this.saveExperimentDocument(experiment.file_id, html, function (err, file) {
                        if (err) {
                            return callback(err);
                        }
                        parameters.file_id = file._id;
                        return saveExperiment(experiment, parameters, callback);
                    });
                });
            } else {
                var experiment = new Experiment();
                _this.saveExperimentDocument(null, html, function (err, file) {
                    if (err) {
                        return callback(err);
                    }
                    parameters.file_id = file._id;
                    return saveExperiment(experiment, parameters, callback);
                });
            }
        },
        /**
         * Search for experiments by the provided parameters.
         * Will pass experiments will the author populated.
         *
         * @param parameters
         * @param callback
         */
        getExperiments: function (parameters, callback) {
            Experiment.find(parameters).populate('author').exec(function (err, experiments) {
                if (err) {
                    return callback(err);
                }
                return callback(null, experiments);
            });
        },
        /**
         * Retrieve an experiment, with the author populated.
         *
         * @param id
         * @param callback
         */
        getExperiment: function (id, callback) {
            Experiment.findOne({'_id': id}).populate('author').exec(function (err, experiment) {
                if (err) {
                    return callback(err);
                }
                return callback(null, experiment);
            });
        },
        /**
         * Retrieve the content of an experiment and pass it to a stream.
         *
         * @param id
         * @param stream
         */
        getExperimentDocument: function (id, stream) {
            var readStream, options = {
                root: COLLECTION,
                _id: id
            };

            readStream = gridfs.createReadStream(options);
            readStream.pipe(stream);
        },
        /**
         * Delete and experiment and its corresponding content.
         * Success is indicated if no error is passed to the callback function.
         *
         * @param id
         * @param callback
         */
        deleteExperiment: function (id, callback) {
            Experiment.findOne({'_id': id}, function (err, experiment) {
                if (err) {
                    return callback(err);
                }

                deleteFile(experiment.file_id, function (err) {
                    if (err) {
                        return callback(err);
                    }

                    experiment.remove(function (err) {
                        callback(err);
                    });
                });
            });
        }
    };

    /**
     * Helper method to save an experiment. If there is an error and the experiment is newly created, the corresponding
     * experiment document will be deleted.
     *
     * @param experiment
     * @param parameters
     * @param callback
     */
    var saveExperiment = function (experiment, parameters, callback) {
        var isNewFile = !!experiment.file_id;

        if (parameters['title']) experiment.title = parameters['title'];
        if (parameters['metric']) experiment.metric = parameters['metric'];
        if (parameters['goal']) experiment.goal = parameters['goal'];
        if (parameters['result']) experiment.result = parameters['result'];
        if (parameters['author']) {
            experiment.author = typeof parameters['author'] === "string" ?
                mongoose.Types.ObjectId(parameters['author']) : parameters['author'];
        }
        if (parameters['file_id']) experiment.file_id = parameters['file_id'];


        experiment.save(function (err, experiment) {
            if (err) {
                if (!isNewFile) {
                    return callback(err);
                }

                // If we have an error creating an experiment, also delete the newly created file
                // We don't want experiment-less files floating around
                return deleteFile(experiment.file_id, function () {
                    return callback(err);
                });
            }

            if (typeof callback === 'function') callback(null, experiment);
        });
    };

    /**
     * Delete an experiment document.
     *
     * @param file_id
     * @param callback
     */
    var deleteFile = function (file_id, callback) {
        gridfs.remove({
            root: COLLECTION,
            _id: file_id
        }, callback);
    };
})();