(function () {
    'use strict';

    var User = require('../models/User'),
        UserSession = require('../util/UserSession'),
        JWT = require('jsonwebtoken');

    var AuthController = {
        token: function (req, res, next) {
            var user, config, token, options, returnObj;

            //get current user
            user = req.user;
            config = req.app.get('auth');
            options = config['options'] || {};
            // create a token
            token = JWT.sign({_id: user.id}, config['secret'], config['options']);
            UserSession.store(token);

            returnObj = {
                access_token: token,
                token_type: 'bearer'
            };
            if (options['expiresIn']) returnObj.expiresIn = options['expiresIn'];

            res.status(200).json(returnObj);
        },
    };

    module.exports = AuthController;
})();
