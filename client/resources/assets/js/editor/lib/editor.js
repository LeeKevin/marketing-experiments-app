(function () {
    'use strict';

    /**
     * Module dependencies.
     */

    var $ = require('jquery');
    var keys = require('./keys');
    var Utils = require('./utils');
    var View = require('./view');
    var Menu = require('./menu');
    var Sanitize = require('./sanitize');

    /**
     * Create an editor instance.
     *
     * @return {Editor}
     * @api public
     */
    module.exports = function () {
        return Editor.apply(null, arguments);
    };

    var Editor = function () {
        /**
         * @private
         */
        var defaults = {
            title: '',
            disable_title: false,
            title_placeholder: 'Title',
            body_placeholder: 'Tell your story…',
            spellcheck: false,
            store_interval: 15000,
            store_url: '',
            store_method: 'POST'
        };
        var properties = {};
        var components = {};
        var events = {};

        var init = function (options) {
            $.extend(properties, defaults, typeof options === "object" ? options : {});

            if (!(properties.el instanceof $) && typeof properties.el === "string") {
                properties.el = $(properties.el);
            }
            if (!(properties.el instanceof $) || (properties.el instanceof $ && $(properties.el).length == 0)) {
                console.error('You must specify a valid HTML element to transform into an Editor.');
                return false;
            }

            //Register events
            this._prepareEvents(properties.el, events);
            store.call(this);
            //initializeWidgets(); TODO finish
            render();
            properties.el.attr({
                "contenteditable": "true",
                "spellcheck": properties.spellcheck
            });
            properties.el.addClass("postField postField--body editable smart-media-plugin");
            properties.el.wrap("<article class='postArticle'><div class='postContent'><div class='notesSource'></div></div></article>");
            appendMenus();
            parseInitialMess();
        };

        var store = function () {
            if (!properties.store_url) {
                return;
            }
            return setTimeout((function (_this) {
                return function () {
                    return checkforStore.call(_this);
                }
            })(this), properties.store_interval);
        };

        var checkforStore = function () {
            if (this.content === this.getContent()) {
                return store(); //reset time interval
            } else {
                this.content = this.getContent();
                return $.ajax({
                    url: properties.store_url,
                    method: properties.store_method,
                    data: {
                        body: this.getContent()
                    },
                    success: function (res) {
                        //Success
                    },
                    complete: (function (_this) {
                        return function () {
                            return _this.store();
                        };
                    })(this)
                });
            }
        };

        var initializeWidgets = function (opts) {
            var base_widgets, self;
            base_widgets = opts.base_widgets;
            self = this;
            if (base_widgets.indexOf("uploader") >= 0) {
                this.uploader_widget = new Dante.View.TooltipWidget.Uploader({
                    current_editor: this
                });
                this.widgets.push(this.uploader_widget);
            }
            if (base_widgets.indexOf("embed") >= 0) {
                this.embed_widget = new Dante.View.TooltipWidget.Embed({
                    current_editor: this
                });
                this.widgets.push(this.embed_widget);
            }
            if (base_widgets.indexOf("embed_extract") >= 0) {
                this.embed_extract_widget = new Dante.View.TooltipWidget.EmbedExtract({
                    current_editor: this
                });
                this.widgets.push(this.embed_extract_widget);
            }
            if (opts.extra_tooltip_widgets) {
                return _.each(opts.extra_tooltip_widgets, (function (_this) {
                    return function (w) {
                        if (!w.current_editor) {
                            w.current_editor = self;
                        }
                        return _this.widgets.push(w);
                    };
                })(this));
            }
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

            //this.tooltip_view = new this.tooltip_class({
            //    editor: this,
            //    widgets: this.widgets
            //});
            //this.pop_over = new Dante.Editor.PopOver({
            //    editor: this
            //});
            //this.pop_over.render().hide();
            //return this.tooltip_view.render().hide();
        };

        var parseInitialMess = function () {
            setupElementsClasses(properties.el.find('.section-inner'), function (element) {
                return handleUnwrappedImages(element);
            });
        };

        var setupElementsClasses = function (element, callback) {
            cleanContents(element);
            wrapTextNodes(element);
            element.children().each(function (i, child) {
                setElementName(addClassesToElement(child));
            });
            setupLinks(element.find("a"));
            setupFirstAndLast();
            if (typeof callback === 'function') {
                return callback(element);
            }
        };

        var cleanContents = function (element) {
            var s = new Sanitize({
                elements: ['strong', 'img', 'em', 'br', 'a', 'blockquote', 'b', 'u', 'i', 'pre', 'p', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li'],
                attributes: {
                    '__ALL__': ['class'],
                    a: ['href', 'title', 'target'],
                    img: ['src']
                },
                protocols: {
                    a: {
                        href: ['http', 'https', 'mailto']
                    }
                },
                transformers: [
                    function (input) {
                        if (input.node_name === "span" && $(input.node).hasClass("defaultValue")) {
                            return {
                                whitelist_nodes: [input.node]
                            };
                        }
                        if ($(input.node).hasClass("dante-paste")) {
                            return {
                                whitelist_nodes: [input.node]
                            };
                        } else {
                            return null;
                        }
                    }, function (input) {
                        if (input.node_name === 'div' && $(input.node).hasClass("graf--mixtapeEmbed")) {
                            return {
                                whitelist_nodes: [input.node]
                            };
                        } else if (input.node_name === 'a' && $(input.node).parent(".graf--mixtapeEmbed").exists()) {
                            return {
                                attr_whitelist: ["style"]
                            };
                        } else {
                            return null;
                        }
                    }, function (input) {
                        if (input.node_name === 'figure' && $(input.node).hasClass("graf--iframe")) {
                            return {
                                whitelist_nodes: [input.node]
                            };
                        } else if (input.node_name === 'div' && $(input.node).hasClass("iframeContainer") && $(input.node).parent(".graf--iframe").exists()) {
                            return {
                                whitelist_nodes: [input.node]
                            };
                        } else if (input.node_name === 'iframe' && $(input.node).parent(".iframeContainer").exists()) {
                            return {
                                whitelist_nodes: [input.node]
                            };
                        } else if (input.node_name === 'figcaption' && $(input.node).parent(".graf--iframe").exists()) {
                            return {
                                whitelist_nodes: [input.node]
                            };
                        } else {
                            return null;
                        }
                    }, function (input) {
                        if (input.node_name === 'figure' && $(input.node).hasClass("graf--figure")) {
                            return {
                                whitelist_nodes: [input.node]
                            };
                        } else if (input.node_name === 'div' && ($(input.node).hasClass("aspectRatioPlaceholder") && $(input.node).parent(".graf--figure").exists())) {
                            return {
                                whitelist_nodes: [input.node]
                            };
                        } else if (input.node_name === 'div' && ($(input.node).hasClass("aspect-ratio-fill") && $(input.node).parent(".aspectRatioPlaceholder").exists())) {
                            return {
                                whitelist_nodes: [input.node]
                            };
                        } else if (input.node_name === 'img' && $(input.node).parent(".graf--figure").exists()) {
                            return {
                                whitelist_nodes: [input.node]
                            };
                        } else if (input.node_name === 'a' && $(input.node).parent(".graf--mixtapeEmbed").exists()) {
                            return {
                                attr_whitelist: ["style"]
                            };
                        } else if (input.node_name === 'figcaption' && $(input.node).parent(".graf--figure").exists()) {
                            return {
                                whitelist_nodes: [input.node]
                            };
                        } else if (input.node_name === 'span' && $(input.node).parent(".imageCaption").exists()) {
                            return {
                                whitelist_nodes: [input.node]
                            };
                        } else {
                            return null;
                        }
                    }
                ]
            });

            if (element.length > 0) {
                return element.html(s.clean_node(element[0]));
            }
        };

        var wrapTextNodes = function (element) {
            return element.contents().filter(function () {
                return this.nodeType === 3 && this.data.trim().length > 0;
            }).wrap("<p class='graf grap--p'></p>");
        };

        var addClassesToElement = function (element) {
            var n, name, new_el;
            n = element;
            name = n.nodeName.toLowerCase();
            switch (name) {
                case "p":
                case "pre":
                case "div":
                    if (!$(n).hasClass("graf--mixtapeEmbed")) {
                        $(n).removeClass().addClass("graf graf--" + name);
                    }
                    if (name === "p" && $(n).find("br").length === 0) {
                        $(n).append("<br>");
                    }
                    break;
                case "h1":
                case "h2":
                case "h3":
                case "h4":
                case "h5":
                case "h6":
                    if (name === "h1") {
                        new_el = $("<h2 class='graf graf--h2'>" + ($(n).text()) + "</h2>");
                        $(n).replaceWith(new_el);
                        this.setElementName(n);
                    } else {
                        $(n).removeClass().addClass("graf graf--" + name);
                    }
                    break;
                case "code":
                    $(n).unwrap().wrap("<p class='graf graf--pre'></p>");
                    n = $(n).parent();
                    break;
                case "ol":
                case "ul":
                    Utils.log("lists");
                    $(n).removeClass().addClass("postList");
                    $(n).find("li").each(function (i, li) {
                        return $(li).removeClass().addClass("graf graf--li");
                    });
                    break;
                case "img":
                    Utils.log("images");
                    //this.uploader_widget.uploadExistentImage(n); TODO: uploader widget
                    break;
                case "a":
                case 'strong':
                case 'em':
                case 'br':
                case 'b':
                case 'u':
                case 'i':
                    Utils.log("links");
                    $(n).wrap("<p class='graf graf--p'></p>");
                    n = $(n).parent();
                    break;
                case "blockquote":
                    n = $(n).removeClass().addClass("graf graf--" + name);
                    break;
                case "figure":
                    if ($(n).hasClass(".graf--figure")) {
                        n = $(n);
                    }
                    break;
                default:
                    $(n).wrap("<p class='graf graf--" + name + "'></p>");
                    n = $(n).parent();
            }
            return n;
        };

        var setElementName = function (element) {
            return $(element).attr("name", Utils.generateUniqueName());
        };

        var setupLinks = function (elems) {
            elems.each(elems, function (i, link) {
                setupLink(link);
            });
        };

        var setupLink = function (link) {
            var href, parent_name;
            parent_name = $(link).parent().prop("tagName").toLowerCase();
            $(link).addClass("markup--anchor markup--" + parent_name + "-anchor");
            return $(link).attr("data-href", $(link).attr("href"));
        };

        var setupFirstAndLast = function () {
            var children = properties.el.find(".section-inner").children();
            children.removeClass("graf--last , graf--first");
            children.first().addClass("graf--first");
            return children.last().addClass("graf--last");
        };

        var handleUnwrappedImages = function (elements) {
            return elements.find("img").each(function (image) {
                //return _this.uploader_widget.uploadExistentImage(image); TODO: uploader widget
            });
        };


        /**
         * Public Editor object
         * @public
         */
        var editor = Utils.extend(Object.create(View()), {
            /**
             * Evoke a store action
             */
            store: function () {
                store.call(this);
            },
            getContent: function () {
                return properties.el.find(".section-inner").html();
            }
        });

        var result = init.apply(editor, arguments);
        return result ? editor : false;
    };
})();