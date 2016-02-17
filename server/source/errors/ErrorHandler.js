(function () {
    'use strict';

    module.exports = function ErrorHandler(err, req, res, next) {
        console.error(err.stack);
        res.status(500).send(err.message);
    };

})();
