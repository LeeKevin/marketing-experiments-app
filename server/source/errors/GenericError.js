(function () {
    'use strict';

    var sys = require('sys');

    var GenericError = function (name, status, message) {
        this.name = name ? name : 'System Error'
        this.status = status ? status : 500;
        this.message = message ? message : 'There was an error processing your request.';
    };

    sys.inherits(GenericError, Error);

    module.exports = GenericError;
})();
