(function () {
    'use strict';

    var Backbone = require('backbone'),
        Util = require('../lib/util');

    module.exports = Backbone.Model.extend({
        urlRoot: Util.getServerLocation('experiments'),
        initialize: function () {

        },
    });
})();