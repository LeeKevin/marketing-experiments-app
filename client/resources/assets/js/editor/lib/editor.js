(function () {
    'use strict';

    /**
     * Module dependencies.
     */

    var $ = require('jquery');
    var keys = require('./keys');
    var Menu = require('./menu');

    /**
     * Create an editor instance.
     *
     * @return {Editor}
     * @api public
     */
    module.exports = function () {
        return Object.create(Editor());
    };

    var Editor = function () {
        /**
         * @private
         */
        var defaults = {
            title: '',
            title_placeholder: 'Title',
            body_placeholder: 'Tell your story…'
        };
        var properties = {};
        var components = {};

        var init = function (options) {
            $.extend(properties, defaults, typeof options === "object" ? options : {});

            if (!(properties.el instanceof $) && typeof properties.el === "string") {
                properties.el = $(properties.el);
            }
            if (!(properties.el instanceof $) || (properties.el instanceof $ && $(properties.el).length == 0)) {
                console.error('You must specify a valid HTML element to transform into an Editor.');
                return;
            }

            render.call(this);
            properties.el.attr("contenteditable", "true");
            properties.el.addClass("postField postField--body editable smart-media-plugin");
            properties.el.wrap("<article class='postArticle'><div class='postContent'><div class='notesSource'></div></div></article>");
        };

        var render = function () {
            return properties.el.html(
                "<section class='section--first section--last'> <div class='section-divider layoutSingleColumn'> <hr class='section-divider'> </div> <div class='section-content'> <div class='section-inner layoutSingleColumn'> "
                + (
                    properties.disable_title ? '' :
                    "<h3 class='graf graf--h3'>" + (properties.title.length > 0 ? properties.title : properties.title_placeholder) + "</h3>"
                )
                + " <p class='graf graf--p'>"
                + properties.body_placeholder
                + "</p> </div> </div> </section>"
            );
        };

        var appendMenus = function () {
            var menu = $("<div id='dante-menu' class='dante-menu'></div>").insertAfter(properties.el);
            var tooltip = $("<div class='inlineTooltip'></div>").insertAfter(properties.el);

            components.editor_menu = Menu({
                editor: this,
                el: menu
            });

            this.tooltip_view = new this.tooltip_class({
                editor: this,
                widgets: this.widgets
            });
            this.pop_over = new Dante.Editor.PopOver({
                editor: this
            });
            this.pop_over.render().hide();
            return this.tooltip_view.render().hide();
        };

        /**
         * Public Editor object
         * @public
         */
        var editor = {};

        init.apply(editor, arguments);
        return editor;
    };
})();