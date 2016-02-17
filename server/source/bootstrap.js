(function () {
    'use strict';

    var fs = require('fs');

    module.exports = function(app) {

        // Load and execute service providers
        fs.readdirSync('./source/providers').forEach(function(file) {
            if (file.substr(file.lastIndexOf('.') + 1) !== 'js') return;
            var name = file.substr(0, file.indexOf('.'));
            require('./providers/' + name)(app);
        });

        // Load middleware
        require('./middleware/kernel')(app);
    }
})();
