(function () {
    'use strict';

    var Backbone = require('backbone'),
        Mustache = require('mustache'),
        $ = require('jquery'),
        Partials = require('../../partials/partials');

    /**
     * Utility module for helper/miscellaneous methods.
     */

    module.exports = {
        renderPartial: function (partial_name, params) {
            if (!Partials.hasOwnProperty(partial_name)) return '';
            if (typeof params != 'object') params = {};
            var partial = Partials[partial_name];
            Mustache.parse(partial);

            return Mustache.render(partial, params);
        },
        getLocation: function () {
            return window.location.protocol + '//' + window.location.host
                + '/' + Backbone.history.options.root + Backbone.history.getFragment();
        },
        getScrollBarWidth: function () {
            var $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body'),
                widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).outerWidth();
            $outer.remove();
            return 100 - widthWithScroll;
        },
    };

})();
