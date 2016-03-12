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
            Cookies.set('token', token, {expires: 1});
        },
        setUser: function (token) {
            try {
                var user = JSON.parse(Cookies.get('user'));
            } catch (e) {
                return false;
            }
            $.ajax({
                url: Util.getServerLocation('users/' + user.user_id),
                method: "GET",
                headers: {"Authorization": 'Bearer ' + token},
                success: function (user) {
                    Cookies.set('user', user, {expires: 1});
                }
            });
        },
        setCookie: function (name, value, options) {
            Cookies.remove(name);
            Cookies.set(name, value, options);
        }
    };

})();
