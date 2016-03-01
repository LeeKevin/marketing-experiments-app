(function () {
    'use strict';

        var Backbone = require('backbone'),
            $ = require('jquery'),
            HeaderView = require('../views/header'),
            HomeView = require('../views/home');

    module.exports = Backbone.Router.extend({
        routes: {
            "": "home",
        },
        initialize: function () {
            this.headerView = new HeaderView();
            $('.header').html(this.headerView.el);
        },
        home: function () {
            if (!this.homeView) {
                this.homeView = new HomeView();
            }
            $('#content').html(this.homeView.el);
        },
    });
})();