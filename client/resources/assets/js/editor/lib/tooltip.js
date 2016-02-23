(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var $ = require('jquery');
    var Utils = require('./utils');
    var View = require('./view');

    /**
     * Create a Menu instance.
     *
     * @return {Menu}
     * @api public
     */
    module.exports = function () {
        return Tooltip.apply(null, arguments);
    };

    function Tooltip() {
        /**
         * @private
         */
        var properties = {};
        var components = {};

        var prepareProperties = function (options) {
            $.extend(properties, typeof options === "object" ? options : {});

            if (!(properties.el instanceof $) && typeof properties.el === "string") {
                properties.el = $(properties.el);
            }
            if (!(properties.el instanceof $) || (properties.el instanceof $ && $(properties.el).length == 0)) {
                console.error('You must specify a valid HTML element to transform into a Tooltip.');
                return;
            }
        };

        var init = function () {

        };

        /* Event listeners */

        var events = {
        };

        /* END Event listeners */

        /**
         * Public Tooltip object
         * @public
         */
        prepareProperties.apply(null, arguments);
        var tooltip = Utils.extend(Object.create(View(properties, events)), {
            show: function () {

            },
            hide: function () {

            },
            move: function (coordinates) {

            },
            cleanOperationClasses: function ($node) {

            }
        });

        init.call(tooltip);
        return tooltip;
    }
})();

(function () {
    var old = (function (_super) {
        __extends(Tooltip, _super);

        function Tooltip() {
            this.hide = __bind(this.hide, this);
            this.toggleOptions = __bind(this.toggleOptions, this);
            this.render = __bind(this.render, this);
            this.initialize = __bind(this.initialize, this);
            return Tooltip.__super__.constructor.apply(this, arguments);
        }

        Tooltip.prototype.el = ".inlineTooltip";

        Tooltip.prototype.events = {
            "click .inlineTooltip-button.control": "toggleOptions",
            "click .inlineTooltip-menu button": "handleClick"
        };

        Tooltip.prototype.initialize = function (opts) {
            if (opts == null) {
                opts = {};
            }
            this.current_editor = opts.editor;
            return this.widgets = opts.widgets;
        };

        Tooltip.prototype.template = function () {
            var menu;
            menu = "";
            _.each(this.widgets, function (b) {
                var data_action_value;
                data_action_value = b.action_value ? "data-action-value='" + b.action_value + "'" : "";
                return menu += "<button class='inlineTooltip-button scale' title='" + b.title + "' data-action='inline-menu-" + b.action + "' " + data_action_value + "> <span class='tooltip-icon " + b.icon + "'></span> </button>";
            });
            return "<button class='inlineTooltip-button control' title='Close Menu' data-action='inline-menu'> <span class='tooltip-icon icon-plus'></span> </button> <div class='inlineTooltip-menu'> " + menu + " </div>";
        };

        Tooltip.prototype.findWidgetByAction = function (name) {
            return _.find(this.widgets, function (e) {
                return e.action === name;
            });
        };

        Tooltip.prototype.render = function () {
            $(this.el).html(this.template());
            $(this.el).addClass("is-active");
            return this;
        };

        Tooltip.prototype.toggleOptions = function () {
            utils.log("Toggle Options!!");
            $(this.el).toggleClass("is-scaled");
            return false;
        };

        Tooltip.prototype.move = function (coords) {
            var control_spacing, control_width, coord_left, coord_top, pull_size, tooltip;
            tooltip = $(this.el);
            control_width = tooltip.find(".control").css("width");
            control_spacing = tooltip.find(".inlineTooltip-menu").css("padding-left");
            pull_size = parseInt(control_width.replace(/px/, "")) + parseInt(control_spacing.replace(/px/, ""));
            coord_left = coords.left - pull_size;
            coord_top = coords.top;
            return $(this.el).offset({
                top: coord_top,
                left: coord_left
            });
        };

        Tooltip.prototype.handleClick = function (ev) {
            var detected_widget, name, sub_name;
            name = $(ev.currentTarget).data('action');
            utils.log(name);

            /*
             switch name
             when "inline-menu-image"
             @placeholder = "<p>PLACEHOLDER</p>"
             @imageSelect(ev)
             when "inline-menu-embed"
             @displayEmbedPlaceHolder()
             when "inline-menu-embed-extract"
             @displayExtractPlaceHolder()
             when "inline-menu-hr"
             @splitSection()
             */
            sub_name = name.replace("inline-menu-", "");
            if (detected_widget = this.findWidgetByAction(sub_name)) {
                detected_widget.handleClick(ev);
            }
            return false;
        };

        Tooltip.prototype.cleanOperationClasses = function (node) {
            return node.removeClass("is-embedable is-extractable");
        };

        Tooltip.prototype.hide = function () {
            return $(this.el).removeClass("is-active is-scaled");
        };

        return Tooltip;

    })(Dante.View);

});
