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
        },
        trim: function (str, character) {
            var escapedCharacter = this.escapeRegExp(character);
            return str.replace(new RegExp("^" + escapedCharacter + "+|" + escapedCharacter + "+$", "gm"), '');
        },
        escapeRegExp: function (str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },
    };

})();
