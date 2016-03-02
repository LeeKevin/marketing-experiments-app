(function () {
    'use strict';

    var Backbone = require('backbone'),
        Experiment = require('../models/Experiment'),
        Util = require('../lib/util');

    module.exports = Backbone.Collection.extend({
        model: Experiment,
        url: Util.getServerLocation('experiments'),
    });
})();