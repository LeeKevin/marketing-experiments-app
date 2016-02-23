(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var Utils = require('./utils');
    var View = require('./view');

    /**
     * Create a Widget instance.
     *
     * @return {Widget}
     * @api public
     */
    module.exports = function () {
        return Object.create(Menu.apply(null, arguments));
    };

    function Widget() {

        /**
         * @private
         */
        var properties = {};
        var prepareProperties = function (widget_properties) {
            return properties = widget_properties || {};
        };


        /**
         * Public Widget object
         * @public
         */
        prepareProperties.apply(null, arguments);
        var widget = Utils.extend(Object.create(View(properties, events)), {
            hide: function () {
                return properties.editor.tooltip_view.hide();
            }
        });

        return widget;
    }

})();

Dante.View.TooltipWidget = (function (_super) {
    __extends(TooltipWidget, _super);

    function TooltipWidget() {
        this.hide = __bind(this.hide, this);
        return TooltipWidget.__super__.constructor.apply(this, arguments);
    }

    TooltipWidget.prototype.initialize = function (opts) {
        if (opts == null) {
            opts = {};
        }
        this.icon = opts.icon;
        this.title = opts.title;
        return this.actionEvent = opts.title;
    };

    TooltipWidget.prototype.hide = function () {
        return this.current_editor.tooltip_view.hide();
    };

    return TooltipWidget;

})(Dante.View);
