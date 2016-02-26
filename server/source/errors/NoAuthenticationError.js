(function () {
    'use strict';

    var sys = require('sys');

    var NoAuthenticationError = function (message) {
        this.name = 'Invalid Client'
        this.status = 401;
        this.message = message ? message : 'You must supply valid credentials.';
    };

    sys.inherits(NoAuthenticationError, Error);

    module.exports = NoAuthenticationError;
})();
