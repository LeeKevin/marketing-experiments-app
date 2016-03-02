(function () {
    'use strict';

    var Backbone = require('backbone'),
        $ = require('jquery'),
        Util = require('../lib/util');

    module.exports = Backbone.View.extend({
        initialize: function () {
            this.template = function (params) {
                return Util.renderPartial('experiment-preview', params);
            };
        },
        render: function () {
            var templateParameters = Util.recursiveMergeObjects(this.model.attributes, {
                author: {
                    initials: this.model.getAuthorInitials(),
                    fullname: this.model.getAuthorName()
                }
            });

            $(this.el).html(this.template(templateParameters));
            return this;
        }
    });
})();