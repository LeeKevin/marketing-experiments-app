(function () {
    'use strict';

    var Backbone = require('backbone'),
        Mustache = require('mustache'),
        $ = require('jquery'),
        Partials = require('../../partials/partials'),
        config = require('config');

    /**
     * Utility module for helper/miscellaneous methods.
     */

    module.exports = {
        getServerLocation: function (uri) {
            return 'http://' + config['server']['url'] +
                (config['server']['port'] ? ':' + config['server']['port'] : '') +
                '/' + (config['server']['api'] ? this.trim(config['server']['api'], '/') + '/' : '') + uri;
        },
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
        timeSince: function (date) {
            date = (date instanceof Date) ? date : (typeof date == 'string' ? new Date(date) : null);

            if (!date) return '';

            var seconds = Math.floor((new Date() - date) / 1000);

            var interval = Math.floor(seconds / 31536000);

            if (interval > 1) {
                return interval + " years ago";
            }
            interval = Math.floor(seconds / 2592000);
            if (interval > 1) {
                return interval + " months ago";
            }
            interval = Math.floor(seconds / 86400);
            if (interval > 1) {
                return interval + " days ago";
            }
            interval = Math.floor(seconds / 3600);
            if (interval > 1) {
                return interval + " hours ago";
            }
            interval = Math.floor(seconds / 60);
            if (interval > 1) {
                return interval + " minutes ago";
            }
            return Math.floor(seconds) + " seconds ago";
        },
        trim: function (str, character) {
            var escapedCharacter = this.escapeRegExp(character);
            return str.replace(new RegExp("^" + escapedCharacter + "+|" + escapedCharacter + "+$", "gm"), '');
        },
        escapeRegExp: function (str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },
        recursiveMergeObjects: function () {
            var deepExtend = $.extend.bind(this, true, {});
            return deepExtend.apply(this, arguments);
        }
    };

})();
