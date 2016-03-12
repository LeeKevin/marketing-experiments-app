(function () {
    'use strict';

    var NoAuthenticationError = require('../errors/NoAuthenticationError'),
        InvalidCredentialsError = require('../errors/InvalidCredentialsError'),
        GenericError = require('../errors/GenericError'),
        JWT = require('jsonwebtoken'),
        User = require('../models/User'),
        UserSession = require('../util/UserSession'),
        Twitter = require("node-twitter-api"),
        auth = require('../../config/auth')
        ;

    module.exports.refresh = function (req, res, next) {
        var config, authorization;

        authorization = req.get('authorization');
        if (!authorization) throw new NoAuthenticationError();

        config = req.app.get('auth');
        // If token passed with Bearer scheme
        if (authorization.toLowerCase().slice(0, "bearer".length) === "bearer") {
            throw new NoAuthenticationError();
        }
        // Passed in existing token to refresh
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

    module.exports.local = function (req, res, next) {
        var authorization = req.get('authorization');
        if (!authorization) throw new NoAuthenticationError();

        // Else check for credentials in Basic scheme
        var credentials = getHeaderCredentials(authorization);
        User.findOne({'username': credentials.username}, function (err, user) {
            if (err) {
                return next(err);
            } else if (!user) {
                return next(new InvalidCredentialsError());
            }

            if (!user.checkPassword(credentials.password)) return next(new InvalidCredentialsError());

            req.user = user;
            return next();
        });
    };

    module.exports.twitter = {
        requestToken: function (req, res, next) {
            var auth = req.app.get('auth');
            var twitter = new Twitter({
                consumerKey: auth.twitter.consumerKey,
                consumerSecret: auth.twitter.consumerSecret,
                callback: req.query.callbackUrl
            });

            twitter.getRequestToken(function (err, requestToken, requestSecret) {
                if (err)
                    res.status(500).send(err);
                else {
                    req.app.set('_requestSecret', requestSecret);
                    res.json("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken);
                }
            });
        },
        getUser: function (req, res, next) {
            var auth = req.app.get('auth');
            var twitter = new Twitter({
                consumerKey: auth.twitter.consumerKey,
                consumerSecret: auth.twitter.consumerSecret
            });

            var requestToken = req.query.oauth_token,
                verifier = req.query.oauth_verifier;

            twitter.getAccessToken(requestToken, req.app.get('_requestSecret'), verifier, function (err, accessToken, accessSecret) {
                req.app.set('_requestSecret', '');
                if (err) {
                    return next(err);
                }
                twitter.verifyCredentials(accessToken, accessSecret, function (err, profile) {
                    if (err) {
                        return next(err);
                    }

                    User.findOne({'twitter.id': profile.id}, function (err, user) {
                        if (err) {
                            return next(err);
                        }

                        if (user) {
                            req.user = user;
                            return next();
                        }

                        // if there is no user, create them
                        var newUser = new User();
                        newUser.twitter.id = profile.id;
                        //TODO: generate unique username if twitter handle is already taken
                        newUser.username = newUser.twitter.username = profile.screen_name;
                        newUser.name = profile.name;
                        //Need to get applciation whitelisted for email access
                        newUser.email = "placeholder" + Math.random() + "@test.com";

                        // save our user into the database
                        newUser.save(function(err) {
                            if (err) {
                                return next(err);
                            }
                            req.user = newUser;
                            return next();
                        });
                    });
                });
            });
        }
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
