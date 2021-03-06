(function () {
    'use strict';

    var $ = require('jquery'),
        Backbone = require('backbone'),
        MainRouter = require('./routes/Main'),
        ExperimentsRouter = require('./routes/ExperimentsRouter')
        ;

    Backbone.$ = $;

    $(document).ready(function () {
        //load routes
        new ExperimentsRouter();
        new MainRouter();

        //var editor = new MediumEditor('.editor', {
        //    buttonLabels: 'fontawesome'
        //});

    });
})();