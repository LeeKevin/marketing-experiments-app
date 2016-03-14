(function () {
    'use strict';

    var Backbone = require('backbone'),
        $ = require('jquery'),
        Util = require('../lib/util'),
        ExperimentPreviewView = require('./experimentPreview');

    module.exports = Backbone.View.extend({
        initialize: function () {
            var _this = this;
            this.template = function (params) {
                return Util.renderPartial('home', params);
            };
            this.experimentPreviewViews = [];

            this.collection.each(function (experiment) {
                _this.experimentPreviewViews.push(new ExperimentPreviewView({model: experiment}));
            });
        },
        render: function () {
            var _this = this;
            $(this.el).html(this.template());

            this.$('.content-section').empty();
            if (this.experimentPreviewViews.length == 0) {
                _this.$('.content-section').append('There are no featured experiments!');
                return this;
            }
            $.each(this.experimentPreviewViews, function (i, view) {
                $(view.el).addClass('content-box');
                _this.$('.content-section').append(view.render().el);
            });

            return this;
        },
        /**
         * Assign a subview to an element in the current view scope
         * @param view
         * @param selector
         */
        assign: function (view, selector) {
            view.setElement(this.$(selector)).render();
        }
    });
})();