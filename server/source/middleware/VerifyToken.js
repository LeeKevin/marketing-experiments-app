(function () {
    'use strict';

    var NoAuthenticationError = require('../errors/NoAuthenticationError'),
        InvalidCredentialsError = require('../errors/InvalidCredentialsError'),
        GenericError = require('../errors/GenericError'),
        JWT = require('jsonwebtoken'),
        User = require('../models/User'),
        UserSession = require('../util/UserSession')
        ;

    module.exports = function VerifyToken(req, res, next) {
        var config, authorization;

        authorization = req.get('authorization');
        if (!authorization) throw new NoAuthenticationError();

        config = req.app.get('auth');
        if (!(authorization.toLowerCase().slice(0, "bearer".length) === "bearer")) {
            throw new NoAuthenticationError();
        }

        var token = authorization.slice("bearer".length + 1);
        UserSession.get(token, function (err, session) {
            if (err) {
                return next(err);
            }

            if (!session) {
                return next(new InvalidCredentialsError());
            }

            JWT.verify(token, config.token.secret, function (err, userData) {
                if (err) {
                    return next(new GenericError('Authentication Error', 500, 'There was an error verifying the provided token.'));
                }

                User.findOne({_id: userData._id}, function (err, user) {
                    if (err) {
                        return next(err);
                    }

                    req.user = user;
                    return next();
                });
            });
        });
    };

})();
