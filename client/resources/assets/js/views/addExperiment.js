(function () {
    'use strict';

    var Backbone = require('backbone'),
        $ = require('jquery'),
        Util = require('../lib/util');

    module.exports = Backbone.View.extend({
        initialize: function () {
            this.addExperimentButton = $('#add-experiment').closest('li');

            this.template = function (params) {
                return Util.renderPartial('add-experiment', params);
            };
        },
        render: function () {
            this.addExperimentButton.detach();
            $(this.el).html(this.template());

            return this;
        }
    });
})();