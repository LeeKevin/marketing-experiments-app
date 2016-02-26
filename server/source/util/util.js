(function () {
    'use strict';

    /**
     * Utility module for helper/miscellaneous methods.
     */

    module.exports = {
        iterateObject: function (obj, callback) {
            for (var key in obj) {
                // skip loop if the property is from prototype
                if (!obj.hasOwnProperty(key)) continue;

                if (typeof callback === 'function') callback(key, obj[key]);
            }
        }
    };

})();
