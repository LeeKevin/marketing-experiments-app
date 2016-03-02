(function () {
    'use strict';

    var Backbone = require('backbone'),
        Util = require('../lib/util');

    module.exports = Backbone.Model.extend({
        urlRoot: Util.getServerLocation('experiments'),
        idAttribute: 'experiment_id',
        getAuthorName: function () {
            var author = this.attributes.author;
            return author.name.first + ' ' + author.name.last;
        },
        getAuthorInitials: function () {
            var author = this.attributes.author;
            return (author.name.first.charAt(0) + author.name.last.charAt(0)).toUpperCase();
        }
    });
})();