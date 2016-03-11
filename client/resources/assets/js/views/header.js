(function () {
    'use strict';

    var Backbone = require('backbone'),
        $ = require('jquery'),
        Util = require('../lib/util'),
        LoginView = require('../views/login');

    module.exports = Backbone.View.extend({
        events: {
            "click #login": "signup"
        },
        initialize: function () {
            this.template = function (params) {
                return Util.renderPartial('header', params);
            };

            this.loginModal = new LoginView({
                parent: $(this.el).closest('.layout')
            });

            this.render();
        },
        render: function () {
            $(this.el).css('right', Util.getScrollBarWidth()).html(this.template());
            return this;
        },
        signup: function () {
            this.loginModal.show();
        }
    });
})();