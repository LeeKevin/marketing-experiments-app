(function () {
    'use strict';

    /**
     * Specify which middleware to load on application initialization.
     * These will be automatically used to filter all requests.
     */

    var methodOverride = require('method-override'),
        bodyParser = require('body-parser'),
        errorHandler = require('../errors/ErrorHandler');

    module.exports = function (app) {
        app.use(errorHandler);

        //Accept overriden method sent with 'X-HTTP-Method-Override' header or by '_method' in POST data
        app.use(methodOverride('X-HTTP-Method-Override'));
        app.use(methodOverride('_method'));
        app.use(bodyParser.json()); //populate req.body with parsed json

        //Might want to also include multer for multipart/form-data
    };

})();
