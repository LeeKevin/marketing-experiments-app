(function () {
    'use strict';

    var fs = require('fs'),
        errorHandler = require('./errors/ErrorHandler'),
        NotFoundError = require('./errors/NotFoundError')
        ;

    module.exports = function (app) {
        // Load middleware
        require('./middleware/kernel')(app);

        // Load and execute service providers
        fs.readdirSync('./source/providers').forEach(function (file) {
            if (file.substr(file.lastIndexOf('.') + 1) !== 'js') return;
            var name = file.substr(0, file.indexOf('.'));
            require('./providers/' + name)(app);
        });

        // Load error handlers
        app.use(function(req, res, next){
            next(new NotFoundError());
        });
        app.use(errorHandler);
    };
})();
