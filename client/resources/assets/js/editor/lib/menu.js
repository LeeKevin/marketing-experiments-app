(function () {
    'use strict';

    /**
     * Module dependencies.
     */
    var $ = require('jquery');
    var Utils = require('./utils');

    /**
     * Create a Menu instance.
     *
     * @return {Menu}
     * @api public
     */
    module.exports = function () {
        return Object.create(Menu.apply(null, arguments));
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
                source: /^(?:insertimage|createlink|unlink)$/,
                insert: /^(?:inserthorizontalrule|insert)$/,
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

        var init = function (options) {
            $.extend(properties, defaults, typeof options === "object" ? options : {});

            if (!(properties.el instanceof $) && typeof properties.el === "string") {
                properties.el = $(properties.el);
            }
            if (!(properties.el instanceof $) || (properties.el instanceof $ && $(properties.el).length == 0)) {
                console.error('You must specify a valid HTML element to transform into a Menu.');
                return;
            }

            this.reg = reg;

            render();
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

        var effectNode = function (el, returnAsNodeName) {
            var nodes;
            nodes = [];
            el = el || properties.editor.getElement()[0];
            while (el !== properties.editor.getElement()[0]) {
                if (el.nodeName.match(reg.effectNode)) {
                    nodes.push((returnAsNodeName ? el.nodeName.toLowerCase() : el));
                }
                el = el.parentNode;
            }
            return nodes;
        };

        var displayHighlights = function () {
            var nodes;
            properties.el.find(".active").removeClass("active");
            nodes = effectNode(Utils.getNode());
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

        /* Event listeners */

        var closeInput = function () {
            properties.el.removeClass("dante-menu--linkmode");
            return false;
        };

        var events = {
            //"mousedown li": "handleClick",
            "click .dante-menu-linkinput .dante-menu-button": closeInput
            //"keypress input": "handleInputEnter"
        };

        /* END Event listeners */

        /**
         * Public Menu object
         * @public
         */
        var menu = {
            show: function () {
                properties.el.addClass("dante-menu--active");
                closeInput();
                return displayHighlights();
            },
            hide: function () {
                return properties.el.removeClass("dante-menu--active");
            },
            getElement: function () {
                return properties.el;
            }
        };

        init.apply(menu, arguments);
        return menu;
    };

    var old = (function (_super) {
        __extends(Menu, _super);

        function Menu() {
            this.createlink = __bind(this.createlink, this);
            this.handleInputEnter = __bind(this.handleInputEnter, this);
            this.render = __bind(this.render, this);
            this.template = __bind(this.template, this);
            this.initialize = __bind(this.initialize, this);
            return Menu.__super__.constructor.apply(this, arguments);
        }

        Menu.prototype.el = "#dante-menu";

        Menu.prototype.events = {
            "mousedown li": "handleClick",
            "click .dante-menu-linkinput .dante-menu-button": "closeInput",
            "keypress input": "handleInputEnter"
        };

        Menu.prototype.initialize = function (opts) {
            if (opts == null) {
                opts = {};
            }
            this.config = opts.buttons || this.default_config();
            this.current_editor = opts.editor;
            this.commandsReg = {
                block: /^(?:p|h[1-6]|blockquote|pre)$/,
                inline: /^(?:bold|italic|underline|insertorderedlist|insertunorderedlist|indent|outdent)$/,
                source: /^(?:insertimage|createlink|unlink)$/,
                insert: /^(?:inserthorizontalrule|insert)$/,
                wrap: /^(?:code)$/
            };
            this.lineBreakReg = /^(?:blockquote|pre|div|p)$/i;
            this.effectNodeReg = /(?:[pubia]|h[1-6]|blockquote|[uo]l|li)/i;
            return this.strReg = {
                whiteSpace: /(^\s+)|(\s+$)/g,
                mailTo: /^(?!mailto:|.+\/|.+#|.+\?)(.*@.*\..+)$/,
                http: /^(?!\w+?:\/\/|mailto:|\/|\.\/|\?|#)(.*)$/
            };
        };

        Menu.prototype.default_config = function () {
            return {

                /*
                 buttons: [
                 'blockquote', 'h2', 'h3', 'p', 'code', 'insertorderedlist', 'insertunorderedlist', 'inserthorizontalrule',
                 'indent', 'outdent', 'bold', 'italic', 'underline', 'createlink'
                 ]
                 */
                buttons: ['bold', 'italic', 'h2', 'h3', 'h4', 'blockquote', 'createlink']
            };
        };

        Menu.prototype.template = function () {
            var html;
            html = "<div class='dante-menu-linkinput'><input class='dante-menu-input' placeholder='http://'><div class='dante-menu-button'>x</div></div>";
            html += "<ul class='dante-menu-buttons'>";
            _.each(this.config.buttons, function (item) {
                return html += "<li class='dante-menu-button'><i class=\"dante-icon icon-" + item + "\" data-action=\"" + item + "\"></i></li>";
            });
            html += "</ul>";
            return html;
        };

        Menu.prototype.render = function () {
            $(this.el).html(this.template());
            return this.show();
        };

        Menu.prototype.handleClick = function (ev) {
            var action, element, input;
            element = $(ev.currentTarget).find('.dante-icon');
            action = element.data("action");
            input = $(this.el).find("input.dante-menu-input");
            utils.log("menu " + action + " item clicked!");
            this.savedSel = utils.saveSelection();
            if (/(?:createlink)/.test(action)) {
                if ($(ev.currentTarget).hasClass("active")) {
                    this.removeLink();
                } else {
                    $(this.el).addClass("dante-menu--linkmode");
                    input.focus();
                }
            } else {
                this.menuApply(action);
            }
            return false;
        };

        Menu.prototype.closeInput = function (e) {
            $(this.el).removeClass("dante-menu--linkmode");
            return false;
        };

        Menu.prototype.handleInputEnter = function (e) {
            if (e.which === 13) {
                utils.restoreSelection(this.savedSel);
                return this.createlink($(e.target));
            }
        };

        Menu.prototype.removeLink = function () {
            var elem;
            this.menuApply("unlink");
            elem = this.current_editor.getNode();
            return this.current_editor.cleanContents($(elem));
        };

        Menu.prototype.createlink = function (input) {
            var action, inputValue;
            $(this.el).removeClass("dante-menu--linkmode");
            if (input.val()) {
                inputValue = input.val().replace(this.strReg.whiteSpace, "").replace(this.strReg.mailTo, "mailto:$1").replace(this.strReg.http, "http://$1");
                return this.menuApply("createlink", inputValue);
            }
            action = "unlink";
            return this.menuApply(action);
        };

        Menu.prototype.menuApply = function (action, value) {
            if (this.commandsReg.block.test(action)) {
                utils.log("block here");
                this.commandBlock(action);
            } else if (this.commandsReg.inline.test(action) || this.commandsReg.source.test(action)) {
                utils.log("overall here");
                this.commandOverall(action, value);
            } else if (this.commandsReg.insert.test(action)) {
                utils.log("insert here");
                this.commandInsert(action);
            } else if (this.commandsReg.wrap.test(action)) {
                utils.log("wrap here");
                this.commandWrap(action);
            } else {
                utils.log("can't find command function for action: " + action);
            }
            return false;
        };

        Menu.prototype.setupInsertedElement = function (element) {
            var n;
            n = this.current_editor.addClassesToElement(element);
            this.current_editor.setElementName(n);
            return this.current_editor.markAsSelected(n);
        };

        Menu.prototype.cleanContents = function () {
            return this.current_editor.cleanContents();
        };

        Menu.prototype.commandOverall = function (cmd, val) {
            var message, n;
            message = " to exec 「" + cmd + "」 command" + (val ? " with value: " + val : "");
            if (document.execCommand(cmd, false, val)) {
                utils.log("success" + message);
                n = this.current_editor.getNode();
                this.current_editor.setupLinks($(n).find("a"));
                this.displayHighlights();
                if ($(n).parent().hasClass("section-inner")) {
                    n = this.current_editor.addClassesToElement(n);
                    this.current_editor.setElementName(n);
                }
                this.current_editor.handleTextSelection(n);
            } else {
                utils.log("fail" + message, true);
            }
        };

        Menu.prototype.commandInsert = function (name) {
            var node;
            node = this.current_editor.current_node;
            if (!node) {
                return;
            }
            this.current_editor.current_range.selectNode(node);
            this.current_editor.current_range.collapse(false);
            return this.commandOverall(node, name);
        };

        Menu.prototype.commandBlock = function (name) {
            var list, node;
            node = this.current_editor.current_node;
            list = this.effectNode(this.current_editor.getNode(node), true);
            if (list.indexOf(name) !== -1) {
                name = "p";
            }
            return this.commandOverall("formatblock", name);
        };

        Menu.prototype.commandWrap = function (tag) {
            var node, val;
            node = this.current_editor.current_node;
            val = "<" + tag + ">" + selection + "</" + tag + ">";
            return this.commandOverall("insertHTML", val);
        };

        Menu.prototype.effectNode = function (el, returnAsNodeName) {
            var nodes;
            nodes = [];
            el = el || this.current_editor.$el[0];
            while (el !== this.current_editor.$el[0]) {
                if (el.nodeName.match(this.effectNodeReg)) {
                    nodes.push((returnAsNodeName ? el.nodeName.toLowerCase() : el));
                }
                el = el.parentNode;
            }
            return nodes;
        };

        Menu.prototype.displayHighlights = function () {
            var nodes;
            $(this.el).find(".active").removeClass("active");
            nodes = this.effectNode(utils.getNode());
            utils.log(nodes);
            return _.each(nodes, (function (_this) {
                return function (node) {
                    var tag;
                    tag = node.nodeName.toLowerCase();
                    switch (tag) {
                        case "a":
                            $(_this.el).find('input').val($(node).attr("href"));
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
                            utils.log("nothing to select");
                    }
                    if (tag.match(/(?:h[1-6])/i)) {
                        $(_this.el).find(".icon-bold, .icon-italic, .icon-blockquote").parent("li").remove();
                    } else if (tag === "indent") {
                        $(_this.el).find(".icon-h2, .icon-h3, .icon-h4, .icon-blockquote").parent("li").remove();
                    }
                    return _this.highlight(tag);
                };
            })(this));
        };

        Menu.prototype.highlight = function (tag) {
            return $(".icon-" + tag).parent("li").addClass("active");
        };

        Menu.prototype.show = function () {
            $(this.el).addClass("dante-menu--active");
            this.closeInput();
            return this.displayHighlights();
        };

        Menu.prototype.hide = function () {
            return $(this.el).removeClass("dante-menu--active");
        };

        return Menu;

    });

})();
