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
        save: function (parameters, html, callback) {
            var s, writeStream, options = {
                root: COLLECTION,
                content_type: 'text/html'
            };
            if (parameters.file_id) {
                options._id = parameters.file_id;
            }
            writeStream = gridfs.createWriteStream(options);
            stream(html).pipe(writeStream);

            writeStream.on('finish', function () {
                writeStream.destroy();
            });

            writeStream.on('error', function (err) {
                if (typeof callback === 'function') callback(err);
            });

            writeStream.on('close', function (file) {
                //Now save the Experiment
                if (parameters['_id']) {
                    Experiment.findOne({'_id': parameters['_id']}, function (err, experiment) {
                        saveExperiment(experiment, parameters, file._id, callback);
                    });
                } else {
                    saveExperiment(new Experiment(), parameters, file._id, callback);
                }
            });
        }
    };

    var saveExperiment = function (experiment, parameters, file_id, callback) {
        if (!(experiment instanceof Experiment)) {
            return callback(new GenericError());
        }

        if (parameters['title']) experiment.title = parameters['title'];
        if (parameters['metric']) experiment.metric = parameters['metric'];
        if (parameters['goal']) experiment.goal = parameters['goal'];
        if (parameters['result']) experiment.result = parameters['result'];
        if (parameters['author']) experiment.author = parameters['author'];

        experiment.file_id = file_id;

        experiment.save(function (err, experiment) {
            if (err) {
                return callback(err);
            }

            if (typeof callback === 'function') callback(null, experiment.id);
        });
    };
})();