(function () {
    'use strict';

    var Route = require('express').Router(),
        AuthController = require('../controllers/AuthController'),
        Authenticate = require('../middleware/Authenticate');

    module.exports = function (app) {
        Route.post('/token', Authenticate, AuthController.token);

        app.use('/api', Route);
    };
})();
