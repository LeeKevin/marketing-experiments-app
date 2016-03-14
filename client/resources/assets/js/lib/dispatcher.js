(function () {
    'use strict';

    var $ = require('jquery'),
        Backbone = require('backbone'),
        dispatcher = $.extend(true, {}, Backbone.Events);

    module.exports = dispatcher;

})();