(function () {
    'use strict';
    var $ = require('jquery'),
        Backbone = require('backbone'),
        AddExperimentView = require('../views/addExperiment');

    module.exports = {
        add: function () {
            if (!this.addExperimentView) {
                this.addExperimentView = new AddExperimentView();
                this.on('route', (function (addExperimentRoute, addExperimentView) {
                    return function (route) {
                        var headerControls = $('#header').find('ul.controls');
                        if (route !== addExperimentRoute && !$.contains(headerControls, addExperimentView.addExperimentButton)) {
                            headerControls.prepend(addExperimentView.addExperimentButton);
                        }
                    };
                })(this.routes[Backbone.history.getFragment()], this.addExperimentView));
            }

            this.container.html(this.addExperimentView.render().el);
        }
    };
})();