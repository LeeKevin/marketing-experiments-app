(function () {
    'use strict';

    var Backbone = require('backbone'),
        $ = require('jquery'),
        Util = require('../lib/util');

    module.exports = Backbone.View.extend({
        events: {
            "input .experiment-title": "growTextarea",
            "keypress .experiment-title": "disableEnter"
        },
        initialize: function () {
            this.template = function (params) {
                return Util.renderPartial('add-experiment', params);
            };
        },
        render: function () {
            $(this.el).html(this.template());

            return this;
        },
        growTextarea: function (event) {
            event.target.style.height = (event.target.scrollHeight) + "px";
        },
        disableEnter: function (event) {
            if (event.keyCode == 13) {
                return false;
            }
        }
    });
})();