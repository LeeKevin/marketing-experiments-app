(function () {
    'use strict';
    var AddExperimentView = require('../views/addExperiment');

    module.exports = {
        add: function () {
            if (!this.addExperimentView) {
                this.addExperimentView = new AddExperimentView();
            }

            this.container.html(this.addExperimentView.render().el);
        }
    };
})();