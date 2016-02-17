(function () {
    'use strict';

    /**
     * This is a basic template for a Controller. Define a Controller namespace with defined
     * methods and export the namespace as a module. These Controller methods can be used
     * to execute routes found in the 'routes' directory.
     */

    var User = require('../models/User');

    var HomeController = {
        index: function (req, res) {
            res.send('Hello world!');
        }
    };

    module.exports = HomeController;
})();
