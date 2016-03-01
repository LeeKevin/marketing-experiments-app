(function () {
    'use strict';

    var $ = require('jquery'),
        Backbone = require('backbone'),
        App = require('./routes/routes')
    //MediumEditor = require('medium-editor')
        ;

    Backbone.$ = $;

    //var editor = new MediumEditor('.editor', {
    //    buttonLabels: 'fontawesome'
    //});

    $(document).ready(function () {
        new App();
    });
})();