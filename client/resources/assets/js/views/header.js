(function () {
    'use strict';

    var Backbone = require('backbone'),
        $ = require('jquery'),
        Util = require('../lib/util'),
        LoginView = require('../views/login'),
        Session = require('../lib/session');

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

            //Load existing user session
            var token;
            if (token = Session.getToken()) {
                //load user
                return $.ajax({
                    url: Util.getServerLocation('users/me'),
                    method: 'GET',
                    headers: {'Authorization': 'Bearer ' + token},
                    success: function (user) {
                        this.render(user[0]);
                    }.bind(this),
                    error: function (err) {
                        this.render();
                    }.bind(this)
                });
            } else {
                this.render();
            }
        },
        render: function (user) {
            $(this.el).css('right', Util.getScrollBarWidth()).html(this.template({
                user: user
            }));
            return this;
        },
        signup: function () {
            this.loginModal.show();
        }
    });
})();