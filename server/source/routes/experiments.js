(function () {
    'use strict';

    var Route = require('express').Router(),
        ExperimentsController = require('../controllers/ExperimentsController');
        //VerifyToken = require('../middleware/VerifyToken');

    module.exports = function (app) {
        Route.post('/', ExperimentsController.index);

        //Route.use(VerifyToken); TODO: reenable after testing
        app.use('/api/experiments', Route);
    };
})();
