(function () {
    'use strict';

    var User = require('../models/User'),
        UserSession = require('../util/UserSession'),
        JWT = require('jsonwebtoken');

    var AuthController = {
        token: function (req, res) {
            var user, config, token, options, returnObj;

            //get current user
            user = req.user;
            config = req.app.get('auth');
            options = config.token.options || {};
            //invalidate any old tokens
            UserSession.invalidateByUser(user.id, function () {
                // create a token
                token = JWT.sign({_id: user.id}, config.token.secret, config.token.options);
                UserSession.store(token, user.id);

                returnObj = {
                    access_token: token,
                    token_type: 'bearer',
                    user_id: user.id
                };
                if (options['expiresIn']) returnObj.expiresIn = options['expiresIn'];

                res.status(200).json(returnObj);
            });
        },
    };

    module.exports = AuthController;
})();
