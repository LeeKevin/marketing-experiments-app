(function () {
    'use strict';

    var $ = require('jquery');

    module.exports = function () {
        return {
            _prepareEvents: function (el, events) {
                return $.each(events, (function(_this) {
                    return function (event, f) {
                        var element, event_arr;
                        event_arr = event.split(" ");
                        if (typeof f !== "function") {
                            throw "error: event needs a function";
                        }
                        element = event_arr.length > 1 ? event_arr.splice(1, 3).join(" ") : null;
                        return el.on(event_arr[0], element, f.call(_this));
                    }
                })(this));
            }
        };
    };
})();