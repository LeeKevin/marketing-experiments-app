(function () {
    'use strict';

    var Backbone = require('backbone'),
        Experiment = require('../models/Experiment');

    module.exports = Backbone.Collection.extend({
        model: Experiment,
        url: "" //TODO
    });
})();