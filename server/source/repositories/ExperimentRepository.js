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
        getExperimentDocument: function (id, res) {
            var readStream, options = {
                root: COLLECTION,
                _id: id
            };

            readStream = gridfs.createReadStream(options);
            readStream.pipe(res);
        }
    };

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
                return deleteFile(file_id, function () {
                    return callback(err);
                });
            }

            if (typeof callback === 'function') callback(null, experiment);
        });
    };

    var deleteFile = function (file_id, callback) {
        gridfs.remove({
            root: COLLECTION,
            _id: file_id
        }, callback);
    };
})();