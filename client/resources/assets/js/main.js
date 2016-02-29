(function () {
    'use strict';

    var $ = require('jquery'),
        MediumEditor = require('medium-editor');

    var editor = new MediumEditor('.editor', {
        buttonLabels: 'fontawesome'
    });

    $('.save').bind('click', function (event) {
        event.preventDefault();

        $.ajax({
            type: "POST",
            url: "http://localhost:55555/api/experiments",
            processData: false,
            contentType: 'text/html',
            data: {

                content: $('.editor').html()
            }
        });
    });
})();