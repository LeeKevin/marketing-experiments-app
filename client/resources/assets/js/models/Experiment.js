(function () {
    'use strict';

    var Backbone = require('backbone'),
        $ = require('jquery'),
        Util = require('../lib/util');

    module.exports = Backbone.Model.extend({
        urlRoot: Util.getServerLocation('experiments'),
        idAttribute: 'experiment_id',
        initialize: function () {
            var _this = this;
            if (this.attributes.content.url) {
                $.ajax({
                    url: Util.getServerLocation(this.attributes.content.url),
                    method: "GET",
                    success: function (res) {
                        _this.set({
                            contentHtml: res,
                            contentText: Util.getSnippet(Util.parseHtml(res), 50)
                        });
                    }
                });
            }
        },
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