(function () {
    'use strict';

    var Util = require('../util/util');

    module.exports = function ErrorHandler(err, req, res, next) {
        if (err.stack) console.error(err.stack);
        var status = err.status ? err.status : 500;
        // Handle multiple errors
        if (err.errors) {
            var errors = [];
            Util.iterateObject(err.errors, function (key, error) {
                errors.push({
                    'type': error.name ? error.name + ': ' + key : key,
                    'description': error.message
                });
            });
            res.status(status).json({
                'errors': errors
            });

            return;
        }
        //Handle single error
        res.status(status).json({
            'error': {
                'type': err.name,
                'description': err.message
            }
        });
        return;
    };

})();
