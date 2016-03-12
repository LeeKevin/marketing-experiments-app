(function () {
    'use strict';

    var Backbone = require('backbone'),
        $ = require('jquery'),
        HeaderView = require('../views/header'),
        HomeController = require('../controllers/HomeController'),
        AuthController = require('../controllers/AuthController'),
        Session = require('../lib/session');

    module.exports = Backbone.Router.extend({
        routes: {
            "": "home",
            "twitter": "twitter"
        },
        container: $('#content'),
        initialize: function () {
            new HeaderView({
                el: $('#header')[0]
            });

            // Forward to Backbone router instead of direct linking
            $(document).on("click", "a", (function (router) {
                return function (e) {
                    e.preventDefault();
                    var href = $(e.currentTarget).attr('href');
                    router.navigate(href, true);
                };
            })(this));

            Backbone.history.start({pushState: true});

            //Load exisiting user session
            var token;
            if (token = Session.getToken()) {
                Session.setUser(token);
            }
        },
        home: HomeController.home,
        twitter: AuthController.twitter
    });
})();