(function () {
    'use strict';

    var HomeView = require('../views/home'),
        ExperimentList = require('../collections/ExperimentList');

    module.exports = {
        home: function () {
            var _this = this;
            if (!this.homeView) {
                var experiments = new ExperimentList();
                experiments.fetch({
                    success: function () {
                        _this.homeView = new HomeView({
                            collection: experiments
                        });
                        _this.container.html(_this.homeView.render().el);
                    },
                    error: function (response) {
                        console.error(response, "Error fetching Experiments from server.");
                    }
                });
                return;
            }

            this.container.html(this.homeView.render().el);
        }
    };
})();