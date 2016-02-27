(function () {
    'use strict';

    var Mustache = require('mustache'),
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
    };

})();
