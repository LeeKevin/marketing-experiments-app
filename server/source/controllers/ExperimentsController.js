(function () {
    'use strict';

    var Experiment = require('../models/Experiment'),
        ExperimentRepository = require('../repositories/ExperimentRepository');

    var ExperimentsController = {
        index: function (req, res, next) {
            //ExperimentRepository.save({}, req.body, function (err, file_id) {
            //    //if (err) {
            //    //    return next(err);
            //    //}
            //    //res.json({file_id: file_id});
            //});
        }
    };

    module.exports = ExperimentsController;
})();
