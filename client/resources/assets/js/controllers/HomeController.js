(function () {
    'use strict';

    var $ = require('jquery'),
        HomeView = require('../views/home'),
        ExperimentList = require('../collections/ExperimentList');

    module.exports = {
        home: function () {
            var models =  new ExperimentList;
            models.fetch();
            if (!this.homeView) {
                this.homeView = new HomeView();
            }
            this.container.html(this.homeView.el);
        }
    };
})();