(function () {
    'use strict';

    var sys = require('sys');

    var NotFoundError = function (message) {
        this.name = 'Not Found'
        this.status = 404;
        this.message = message ? message : 'The requested page could not be found.';
    };

    sys.inherits(NotFoundError, Error);

    module.exports = NotFoundError;
})();
