(function () {
    'use strict';

    var Cookies = require('js-cookie'),
        $ = require('jquery'),
        Util = require('./util');

    /**
     * Utility module to manage user sessions
     */
    module.exports = {
        getToken: function () {
            return Cookies.get('token');
        },
        setToken: function (token) {
            Cookies.remove('token');
            Cookies.set('token', token);
        },
        twitterSignIn: function () {
            $.getJSON({
                url: Util.getServerLocation('auth/twitter'),
                data: {callbackUrl: window.location.origin + '/twitter'},
                success: function (res) {
                    window.location.replace(res);
                }
            });
        }
    };

})();
