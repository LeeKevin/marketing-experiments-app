(function () {
    'use strict';

    var fs = require('fs');

    module.exports = function(app){

        // Load routes
        fs.readdirSync('./source/routes').forEach(function(file) {
            if (file.substr(file.lastIndexOf('.') + 1) !== 'js') return;
            var name = file.substr(0, file.indexOf('.'));
            require('../routes/' + name)(app);
        });
    }
})();
