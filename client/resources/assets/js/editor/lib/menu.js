(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var $ = require('jquery');
    var keys = require('./keys');
    var Utils = require('./utils');
    var View = require('./view');

    /**
     * Create a Menu instance.
     *
     * @return {Menu}
     * @api public
     */
    module.exports = function () {
        return Menu.apply(null, arguments);
    };

    function Menu() {
        /**
         * @private
         */
        var defaults = {
            buttons: ['bold', 'italic', 'h2', 'h3', 'h4', 'blockquote', 'createlink']
        };
        var properties = {};
        var components = {};
        var reg = {
            commands: {
                block: /^(?:p|h[1-6]|blockquote|pre)$/,
                inline: /^(?:bold|italic|underline|insertorderedlist|insertunorderedlist|indent|outdent)$/,
                source: /^(?:insertimage|createlink|unlink|inserthorizontalrule)$/,
                wrap: /^(?:code)$/
            },
            lineBreak: /^(?:blockquote|pre|div|p)$/i,
            effectNode: /(?:[pubia]|h[1-6]|blockquote|[uo]l|li)/i,
            str: {
                whiteSpace: /(^\s+)|(\s+$)/g,
                mailTo: /^(?!mailto:|.+\/|.+#|.+\?)(.*@.*\..+)$/,
                http: /^(?!\w+?:\/\/|mailto:|\/|\.\/|\?|#)(.*)$/
            }
        };

        var prepareProperties = function (options) {
            $.extend(properties, defaults, typeof options === "object" ? options : {});

            if (!(properties.el instanceof $) && typeof properties.el === "string") {
                properties.el = $(properties.el);
            }
            if (!(properties.el instanceof $) || (properties.el instanceof $ && $(properties.el).length == 0)) {
                console.error('You must specify a valid HTML element to transform into a Menu.');
                return;
            }

            return properties;
        };

        var init = function () {
            this.reg = reg;
            render();
            return this;
        };

        var render = function () {
            var html = "<div class='dante-menu-linkinput'><input class='dante-menu-input' placeholder='http://'><div class='dante-menu-button'>x</div></div>";
            html += "<ul class='dante-menu-buttons'>";
            $.each(properties.buttons, function (i, item) {
                html += "<li class='dante-menu-button'><i class=\"dante-icon icon-" + item + "\" data-action=\"" + item + "\"></i></li>";
            });
            html += "</ul>";
            properties.el.html(html);
        };

        var displayHighlights = function () {
            var nodes;
            properties.el.find(".active").removeClass("active");
            nodes = nodeTree(Utils.getNode());
            return $.each(nodes, function (i, node) {
                var tag;
                tag = node.nodeName.toLowerCase();
                switch (tag) {
                    case "a":
                        properties.el.find('input').val($(node).attr("href"));
                        tag = "createlink";
                        break;
                    case "i":
                        tag = "italic";
                        break;
                    case "u":
                        tag = "underline";
                        break;
                    case "b":
                        tag = "bold";
                        break;
                    case "code":
                        tag = "code";
                        break;
                    case "ul":
                        tag = "insertunorderedlist";
                        break;
                    case "ol":
                        tag = "insertorderedlist";
                        break;
                    case "li":
                        tag = "indent";
                }
                if (tag.match(/(?:h[1-6])/i)) {
                    properties.el.find(".icon-bold, .icon-italic, .icon-blockquote").parent("li").remove();
                } else if (tag === "indent") {
                    properties.el.find(".icon-h2, .icon-h3, .icon-h4, .icon-blockquote").parent("li").remove();
                }
                return highlight(tag);
            });
        };

        var highlight = function (tag) {
            return $(".icon-" + tag).parent("li").addClass("active");
        };

        /**
         * Apply a menu action
         *
         * @param action
         * @param value
         * @returns {boolean}
         */
        var menuApply = function (action, value) {
            if (reg.commands.block.test(action)) {
                menuActions.commandBlock(action);
            } else if (reg.commands.inline.test(action) || this.commandsReg.source.test(action)) {
                menuActions.commandOverall(action, value);
            } else if (reg.commands.wrap.test(action)) {
                menuActions.commandWrap(action);
            } else {
                console.log("Can't find command function for action: " + action);
            }
            return false;
        };

        var removeLink = function () {
            var elem;
            menuApply("unlink");
            elem = Utils.getEditorNode(properties.editor.getContentElement()[0]);
            properties.editor.getNode();
            return properties.editor.cleanContents($(elem));
        };

        /**
         * Traverse up the editor's node tree from the provided node
         * and return an array of child nodes.
         *
         * @param node
         * @param returnAsNodeName
         * @returns {Array}
         */
        var nodeTree = function(node, returnAsNodeName) {
            var nodes;
            nodes = [];
            node = node || properties.editor.getElement()[0];
            while (node !== properties.editor.getElement()[0]) {
                if (node.nodeName.match(reg.effectNode)) {
                    nodes.push((returnAsNodeName ? node.nodeName.toLowerCase() : node));
                }
                node = node.parentNode;
            }
            return nodes;
        };

        var createlink = function(input) {
            var action, inputValue;
            properties.el.removeClass("dante-menu--linkmode");
            if (input.val()) {
                inputValue = input.val().replace(reg.str.whiteSpace, "").replace(reg.str.mailTo, "mailto:$1").replace(reg.str.http, "http://$1");
                return menuApply("createlink", inputValue);
            }
            action = "unlink";
            return menuApply(action);
        };

        /* Menu Actions */

        var menuActions = {
            commandOverall: function (cmd, val) {
                var node;
                if (document.execCommand(cmd, false, val)) {
                    node = Utils.getEditorNode(properties.editor.getContentElement()[0]);
                    properties.editor.setupLinks($(node).find("a"));
                    displayHighlights();
                    if ($(node).parent().hasClass("section-inner")) {
                        node = properties.editor.addClassesToElement(node);
                        Utils.setUniqueElementName(node);
                    }
                    properties.editor.handleTextSelection(node);
                } else {
                    console.error("failed to exec 「" + cmd + "」 command" + (val ? " with value: " + val : ""), true);
                }
            },
            commandBlock: function (name) {
                var list;
                list = nodeTree(Utils.getEditorNode(properties.editor.getContentElement()[0]), true);
                if (list.indexOf(name) !== -1) {
                    name = "p";
                }
                return this.commandOverall("formatblock", name);
            },
            commandWrap: function (tag) {
                //TODO: this needs fixing before implementation.
                // Will need to remove old selection as it gets added in a code block
                var node, val;
                node = Utils.getEditorNode(properties.editor.getContentElement()[0]);
                val = "<" + tag + ">" + selection + "</" + tag + ">";
                return this.commandOverall("insertHTML", val);
            },
        };

        /* END Menu Actions */

        /* Event listeners */

        var handleClick = function (e) {
            var action, element, input;
            element = $(e.currentTarget).find('.dante-icon');
            action = element.data("action");
            input = properties.el.find("input.dante-menu-input");
            this.savedSel = Utils.saveSelection();
            if (/(?:createlink)/.test(action)) {
                if ($(e.currentTarget).hasClass("active")) {
                    removeLink();
                } else {
                    properties.el.addClass("dante-menu--linkmode");
                    input.focus();
                }
            } else {
                menuApply(action);
            }
            return false;
        };

        var closeInput = function () {
            properties.el.removeClass("dante-menu--linkmode");
            return false;
        };

        var handleInputEnter = function(e) {
            if (e.which === keys.ENTER) {
                Utils.restoreSelection(this.savedSel);
                return createlink($(e.target));
            }
        };

        var events = {
            "mousedown li": handleClick,
            "click .dante-menu-linkinput .dante-menu-button": closeInput,
            "keypress input": handleInputEnter,
        };

        /* END Event listeners */

        /**
         * Public Menu object
         * @public
         */
        prepareProperties.apply(null, arguments);
        var menu = Utils.extend(Object.create(View(properties, events)), {
            show: function () {
                properties.el.addClass("dante-menu--active");
                closeInput();
                return displayHighlights();
            },
            hide: function () {
                return properties.el.removeClass("dante-menu--active");
            }
        });

        return init.call(menu);
    };

})();
