(function () {
    'use strict';

    var Backbone = require('backbone'),
        $ = require('jquery'),
        Util = require('../lib/util');

    module.exports = Backbone.View.extend({
        initialize: function () {
            this.template = function (params) {
                return Util.renderPartial('home', params);
            };
            this.render();
        },
        render: function () {
            $(this.el).html(this.template());
            return this;
        }
    });
})();