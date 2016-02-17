(function () {
    'use strict';

    var HomeController = require('../controllers/HomeController');

    module.exports = function(app) {

        /**
         * Define routes here. You can create other files in this directory
         * which will be automatically loaded into the application.
         * Be sure to copy the basic structure of this file.
         */

        app.get('/', HomeController.index);

    };
})();
