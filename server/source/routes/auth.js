(function () {
    'use strict';

    var Route = require('express').Router(),
        AuthController = require('../controllers/AuthController'),
        Authenticate = require('../middleware/Authenticate');

    module.exports = function (app) {
        Route.get('/token', Authenticate.refresh, AuthController.token);
        Route.get('/auth/local', Authenticate.local, AuthController.token);
        Route.get('/auth/twitter', Authenticate.twitter.requestToken);
        Route.get('/auth/twitter/callback', Authenticate.twitter.getUser, AuthController.token);

        app.use('/api', Route);
    };
})();
