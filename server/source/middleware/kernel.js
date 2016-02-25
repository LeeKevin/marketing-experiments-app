(function () {
    'use strict';

    /**
     * Specify which middleware to load on application initialization.
     * These will be automatically used to filter all requests.
     */

    var methodOverride = require('method-override'),
        bodyParser = require('body-parser')
        ;

    module.exports = function (app) {
        //Accept overriden method sent with 'X-HTTP-Method-Override' header or by '_method' in POST data
        app.use(methodOverride('X-HTTP-Method-Override'));
        app.use(methodOverride('_method'));
        app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
            extended: true
        }));
        app.use(bodyParser.json()); //populate req.body with parsed json
        app.use(bodyParser.text({type: 'text/html'})) //parse HTML body into a string

        //Might want to also include multer for multipart/form-data
    };

})();
