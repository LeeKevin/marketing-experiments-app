(function () {
    'use strict';

    var sys = require('sys');

    var NotFoundError = function (message) {
        this.status = 404;
        this.message = message;
    };

    sys.inherits(NotFoundError, Error);

    module.exports = NotFoundError;
})();
