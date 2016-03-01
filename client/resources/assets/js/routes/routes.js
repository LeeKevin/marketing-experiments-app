(function () {
    'use strict';

    var Backbone = require('backbone'),
        $ = require('jquery'),
        HeaderView = require('../views/header'),
        HomeView = require('../views/home');

    module.exports = Backbone.Router.extend({
        routes: {
            "": "home",
            "test": "test"
        },
        container: $('#content'),
        initialize: function () {
            this.headerView = new HeaderView({
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
        },
        home: function () {
            if (!this.homeView) {
                this.homeView = new HomeView();
            }
            this.container.html(this.homeView.el);
        },
        test: function () {
            alert('test!');
        }
    });
})();