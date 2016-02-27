(function () {
    'use strict';

    var NoAuthenticationError = require('../errors/NoAuthenticationError'),
        InvalidCredentialsError = require('../errors/InvalidCredentialsError'),
        GenericError = require('../errors/GenericError'),
        JWT = require('jsonwebtoken'),
        User = require('../models/User'),
        UserSession = require('../util/UserSession')
        ;

    module.exports = function Authenticate(req, res, next) {
        var config, authorization;

        authorization = req.get('authorization');
        if (!authorization) throw new NoAuthenticationError();

        config = req.app.get('auth');
        if (authorization.toLowerCase().slice(0, "bearer".length) === "bearer") {
            // Passed in existing token to refresh
            var token = authorization.slice("bearer".length + 1);
            UserSession.get(token, function (err, session) {
                if (err) {
                    return next(err);
                }

                if (!session) {
                    return next(new InvalidCredentialsError());
                }

                JWT.verify(token, config['secret'], function (err, user) {
                    if (err) {
                        return next(new GenericError('Authentication Error', 500, 'There was an error verifying the provided token.'));
                    }

                    UserSession.invalidate(token); //invalidate this token before returning a refreshed one
                    req.user = user;
                    return next();
                });
            });

            return;
        }

        // Else check for credentials
        var credentials = getHeaderCredentials(authorization);
        User.findOne({'username': credentials.username}, function (err, user) {
            if (err) {
                return next(err);
            } else if (!user) {
                return next(new InvalidCredentialsError());
            }

            user.checkPassword(credentials.password, function (err, valid) {
                if (err) {
                    return next(err);
                }

                if (!valid) return next(new InvalidCredentialsError());

                req.user = user;
                return next();
            });
        });
    };

    var getHeaderCredentials = function (authorization) {
        if (!(authorization.toLowerCase().slice(0, "basic".length) === "basic")) throw new NoAuthenticationError();
        var credentials = new Buffer(authorization.slice("basic".length + 1), 'base64').toString().split(/:(.+)?/);
        if (credentials.length < 2) throw new NoAuthenticationError();

        return {
            username: credentials[0],
            password: credentials[1]
        };
    };

})();
