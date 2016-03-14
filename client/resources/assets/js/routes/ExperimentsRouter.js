(function () {
    'use strict';

    var Backbone = require('backbone'),
        $ = require('jquery'),
        ExperimentsController = require('../controllers/ExperimentsController');

    module.exports = Backbone.Router.extend({
        routes: {
            "add-experiment": "addExperiment"
        },
        container: $('#content'),
        initialize: function () {

        },
        addExperiment: ExperimentsController.add
    });
})();