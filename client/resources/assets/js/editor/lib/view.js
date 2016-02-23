(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var $ = require('jquery');
    var Utils = require('./utils');

    module.exports = function () {
        /**
         * @private
         */
        var properties = {};
        var init = function (view_properties, events) {
            properties = view_properties || {};

            //Register events
            if (events) this._prepareEvents(properties.el, events);

            return this;
        };

        /**
         * Public View object
         * @public
         */
        var view = {
            /**
             * Bind the provided element to event listeners.
             * The events associative array must be formatted so that the event type and
             * any optional element identifiers are stored within the key and the event listener
             * function is passed as the value.
             *
             * The event listener will be called with `this` as the current (inherited) object instance.
             *
             * E.g.:
             * {"mouseup .optional-element-to-bind": function (event) { ... } }
             * {"click": function (event) { ... } }
             *
             * @param el
             * @param events
             * @private
             */
            _prepareEvents: function (el, events) {
                return $.each(events, (function (_this) {
                    return function (event, f) {
                        var element, event_arr;
                        event_arr = event.split(" ");
                        if (typeof f !== "function") {
                            throw "error: event needs a function";
                        }
                        element = event_arr.length > 1 ? event_arr.splice(1, 3).join(" ") : null;
                        return el.on(event_arr[0], element, Utils.scope(f, _this));
                    }
                })(this));
            },
            /**
             * Retrieve the element assigned to the View object
             * @returns {properties.el|*}
             */
            getElement: function () {
                return properties.el;
            }
        };

        return init.apply(view, arguments);
    };
})();