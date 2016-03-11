(function () {
    'use strict';

    var Backbone = require('backbone'),
        $ = require('jquery'),
        Util = require('../lib/util');

    module.exports = Backbone.View.extend({
        events: {
            "click": "hide",
            "click .modal-close": "hide"
        },
        initialize: function (attrs) {
            this.template = function (params) {
                return Util.renderPartial('login', params);
            };
            this.parent = attrs.parent;
            $(this.el).addClass('modal-overlay');
        },
        show: function (params) {
            if (!$.contains(this.parent, this.el)) {
                $(this.parent).append(this.el);
            }
            $(this.el).html(this.template(params));
            return this;
        },
        hide: function (event) {
            if (!event || event.target !== event.currentTarget) {
                return
            }

            $(this.el).detach();
        }
    });
})();