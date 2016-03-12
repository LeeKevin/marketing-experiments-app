(function () {
    'use strict';
    var $ = require('jquery'),
        Util = require('../lib/util'),
        Session = require('../lib/session');

    module.exports = {
        twitter: function () {
            $.ajax({
                url: Util.getServerLocation('auth/twitter/callback') + location.search,
                method: 'GET',
                success: function (token) {
                    Session.setToken(token.access_token);
                    window.location.replace(window.location.origin);
                }
            });
        }
    };
})();