(function () {
    'use strict';

    var sys = require('sys');

    var InvalidCredentialsError = function (message) {
        this.name = 'Invalid Client'
        this.status = 401;
        this.message = message ? message : 'The supplied credentials are invalid.';
    };

    sys.inherits(InvalidCredentialsError, Error);

    module.exports = InvalidCredentialsError;
})();
