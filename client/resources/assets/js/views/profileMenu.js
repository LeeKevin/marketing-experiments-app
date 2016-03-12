(function () {
    'use strict';

    var Backbone = require('backbone'),
        $ = require('jquery'),
        Util = require('../lib/util'),
        Session = require('../lib/session');

    module.exports = Backbone.View.extend({
        events: {
            "click #logout": "logout"
        },
        initialize: function () {
            this.template = function (params) {
                return Util.renderPartial('profile-menu', params);
            };
            $(this.el).addClass('profile-menu');
        },
        show: function (params) {
            if (!this.parent) {
                this.parent = $('#profile').closest('li')[0];
            }
            if (!$.contains(this.parent, this.el)) {
                $(this.parent).append(this.el);
            }
            $(this.el).html(this.template(params));
            return this;
        },
        hide: function () {
            $(this.el).detach();
        },
        isVisible: function () {
            return $.contains(document, this.el);
        },
        logout: function () {
            Session.end();
            window.location.replace(window.location.origin);
        }
    });
})();