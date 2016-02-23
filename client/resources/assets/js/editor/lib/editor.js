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
    var Tooltip = require('./tooltip');
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

    function Editor() {
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

        var prepareProperties = function (options) {
            $.extend(properties, defaults, typeof options === "object" ? options : {});

            if (!(properties.el instanceof $) && typeof properties.el === "string") {
                properties.el = $(properties.el);
            }
            if (!(properties.el instanceof $) || (properties.el instanceof $ && $(properties.el).length == 0)) {
                console.error('You must specify a valid HTML element to transform into an Editor.');
                return false;
            }

            return properties;
        };

        var init = function () {
            store.call(this);
            //initializeWidgets();
            render();
            properties.el.attr({
                "contenteditable": "true",
                "spellcheck": properties.spellcheck
            });
            properties.el.addClass("postField postField--body editable smart-media-plugin");
            properties.el.wrap("<article class='postArticle'><div class='postContent'><div class='notesSource'></div></div></article>");
            appendMenus.call(this);
            parseInitialMess();

            return this;
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

        var initializeWidgets = function () {
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

            components.tooltip_view = Tooltip({
                editor: this,
                //widgets: this.widgets,
                el: tooltip
            });
            //this.pop_over = new Dante.Editor.PopOver({
            //    editor: this
            //});
            //this.pop_over.render().hide();
            return components.tooltip_view.hide();
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
                Utils.setUniqueElementName(addClassesToElement(child));
            });
            setupLinks(element.find("a"));
            setupFirstAndLast();
            if (typeof callback === 'function') {
                return callback(element);
            }
        };

        var wrapTextNodes = function (element) {
            return element.contents().filter(function () {
                return this.nodeType === 3 && this.data.trim().length > 0;
            }).wrap("<p class='graf grap--p'></p>");
        };

        var setupLink = function (link) {
            var href, parent_name;
            parent_name = $(link).parent().prop("tagName").toLowerCase();
            $(link).addClass("markup--anchor markup--" + parent_name + "-anchor");
            return $(link).attr("data-href", $(link).attr("href"));
        };

        var setupFirstAndLast = function () {
            var children = getContentElement().children();
            children.removeClass("graf--last , graf--first");
            children.first().addClass("graf--first");
            return children.last().addClass("graf--last");
        };

        var handleUnwrappedImages = function (elements) {
            return elements.find("img").each(function (image) {
                //return _this.uploader_widget.uploadExistentImage(image); TODO: uploader widget
            });
        };

        var getSelectedText = function () {
            var text = "";
            if (typeof window.getSelection !== "undefined") {
                text = window.getSelection().toString();
            } else if (typeof document.selection !== "undefined" && document.selection.type === "Text") {
                text = document.selection.createRange().text;
            }
            return text;
        };

        var isSelectingAll = function (element) {
            var a, b;
            a = Utils.killWhiteSpace(getSelectedText()).length;
            b = Utils.killWhiteSpace($(element).text()).length;
            return a === b;
        };

        var displayMenu = function () {
            return setTimeout(function () {
                var pos;
                components.editor_menu.show();
                pos = Utils.getSelectionDimensions();
                relocateMenu(pos);
            }, 10);
        };

        var relocateMenu = function (position) {
            var height, left, padd, top,
                menu_element = components.editor_menu.getElement();
            height = menu_element.outerHeight();
            padd = menu_element.width() / 2;
            top = position.top + $(window).scrollTop() - height;
            left = position.left + (position.width / 2) - padd;
            return menu_element.offset({
                left: left,
                top: top
            });
        };

        var hidePlaceholder = function (element) {
            return $(element).find("span.defaultValue").remove().html("<br>");
        };

        var markAsSelected = function (element) {
            if (typeof element === 'undefined') return;
            properties.el.find(".is-selected").removeClass("is-mediaFocused is-selected");
            $(element).addClass("is-selected");
            $(element).find(".defaultValue").remove();
            if ($(element).hasClass("graf--first")) {
                this.reachedTop = true;
                if ($(element).find("br").length === 0) {
                    return $(element).append("<br>");
                }
            }
        };

        var displayTooltipAt = function (element) {
            element = $(element);
            if (!element || typeof element === 'undefined' || !(element.length > 0) || element[0].tagName === "LI") {
                return;
            }
            components.tooltip_view.hide();
            if (element.text()) {
                return;
            }
            var positions = element.offset();
            components.tooltip_view.show();
            return components.tooltip_view.move(positions);
        };

        var setRangeAt = function (element, pos) {
            var range, sel;
            if (pos == null) {
                pos = 0;
            }
            range = document.createRange();
            sel = window.getSelection();
            range.setStart(element, pos);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return element.focus();
        };

        var scrollTo = function (node) {
            var top;
            if (Utils.isElementInViewport($(node))) {
                return;
            }
            top = node.offset().top;
            return $('html, body').animate({
                scrollTop: top
            }, 20);
        };

        var listify = function ($paragraph, listType, regex) {
            var $li, $list, content;
            removeSpanTag($paragraph);
            content = $paragraph.html().replace(/&nbsp;/g, " ").replace(regex, "");
            switch (listType) {
                case "ul":
                    $list = $("<ul></ul>");
                    break;
                case "ol":
                    $list = $("<ol></ol>");
                    break;
                default:
                    return false;
            }
            addClassesToElement($list[0]);
            replaceWith("li", $paragraph);
            $li = $(".is-selected");
            Utils.setUniqueElementName($li[0]);
            $li.html(content).wrap($list);
            if ($li.find("br").length === 0) {
                $li.append("<br/>");
            }
            setRangeAt($li[0]);
            return $li[0];
        };

        var removeSpanTag = function ($item) {
            var $spans, span, _i, _len;
            $spans = $item.find("span");
            for (_i = 0, _len = $spans.length; _i < _len; _i++) {
                span = $spans[_i];
                if (!$(span).hasClass("defaultValue")) {
                    $(span).replaceWith($(span).html());
                }
            }
            return $item;
        };

        var replaceWith = function (element_type, from_element) {
            var new_paragraph;
            new_paragraph = $("<" + element_type + " class='graf graf--" + element_type + " graf--empty is-selected'><br/></" + element_type + ">");
            from_element.replaceWith(new_paragraph);
            setRangeAt(new_paragraph[0]);
            scrollTo(new_paragraph);
            return new_paragraph;
        };

        var baseParagraphTmpl = function () {
            return "<p class='graf--p' name='" + (Utils.generateUniqueName()) + "'><br></p>";
        };

        var handleSmartList = function ($item, e) {
            var $li, chars, match, regex;
            chars = Utils.getCharacterPrecedingCaret(Utils.getEditorNode(getContentElement()[0]));
            match = chars.match(/^\s*(\-|\*)\s*$/);
            if (match) {
                e.preventDefault();
                regex = new RegExp('/\s*(\-|\*)\s*/');
                $li = listify($item, "ul", regex);
            } else {
                match = chars.match(/^\s*1(\.|\))\s*$/);
                if (match) {
                    e.preventDefault();
                    regex = new RegExp('/\s*1(\.|\))\s*/');
                    $li = listify($item, "ol", regex);
                }
            }
            return $li;
        };

        var handleListBackspace = function ($li, e) {
            var $list, $paragraph, content;
            $list = $li.parent("ol, ul");
            if ($li.prev().length === 0) {
                e.preventDefault();
                $list.before($li);
                content = $li.html();
                replaceWith("p", $li);
                $paragraph = $(".is-selected");
                $paragraph.removeClass("graf--empty").html(content).attr("name", Utils.generateUniqueName());
                if ($list.children().length === 0) {
                    $list.remove();
                }
                return setupFirstAndLast();
            }
        };

        var handleListLineBreak = function ($li, e) {
            var $list, $paragraph, content;
            components.tooltip_view.hide();
            $list = $li.parent("ol, ul");
            $paragraph = $("<p></p>");
            if ($list.children().length === 1 && $li.text() === "") {
                replaceWith("p", $list);
            } else if ($li.text() === "" && ($li.next().length !== 0)) {
                e.preventDefault();
            } else if ($li.next().length === 0) {
                if ($li.text() === "") {
                    e.preventDefault();
                    $list.after($paragraph);
                    $li.addClass("graf--removed").remove();
                } else if ($li.prev().length !== 0 && $li.prev().text() === "" && Utils.getCharacterPrecedingCaret(Utils.getEditorNode(getContentElement()[0])) === "") {
                    e.preventDefault();
                    content = $li.html();
                    $list.after($paragraph);
                    $li.prev().remove();
                    $li.addClass("graf--removed").remove();
                    $paragraph.html(content);
                }
            }
            if ($list && $list.children().length === 0) {
                $list.remove();
            }
            if ($li.hasClass("graf--removed")) {
                addClassesToElement($paragraph[0]);
                setRangeAt($paragraph[0]);
                markAsSelected.call(this, $paragraph[0]);
                return scrollTo($paragraph);
            }
        };

        var handleLineBreakWith = function (element_type, from_element) {
            var new_paragraph;
            new_paragraph = $("<" + element_type + " class='graf graf--" + element_type + " graf--empty is-selected'><br/></" + element_type + ">");
            if (from_element.parent().is('[class^="graf--"]')) {
                new_paragraph.insertAfter(from_element.parent());
            } else {
                new_paragraph.insertAfter(from_element);
            }
            setRangeAt(new_paragraph[0]);
            return scrollTo(new_paragraph);
        };

        var handleTab = function (anchor_node) {
            var classes, next;
            classes = ".graf, .graf--mixtapeEmbed, .graf--figure, .graf--figure";
            next = $(anchor_node).next(classes);
            if ($(next).hasClass("graf--figure")) {
                next = $(next).find("figcaption");
                setRangeAt(next[0]);
                markAsSelected.call(this, next.parent(".graf--figure"));
                displayTooltipAt(next);
                scrollTo($(next));
                return false;
            }
            if (!next || typeof next[0] === "undefined" || next.length == 0) {
                next = $(".graf:first");
            }
            setRangeAt(next[0]);
            markAsSelected.call(this, next);
            displayTooltipAt(next);
            return scrollTo($(next));
        };

        var handleEnter = function (anchor_node, e) {
            var parent = $(anchor_node);
            properties.el.find(".is-selected").removeClass("is-selected");
            if (parent.hasClass("graf--p")) {
                var li = handleSmartList(parent, e);
                if (li) {
                    anchor_node = li;
                }
            } else if (parent.hasClass("graf--li")) {
                handleListLineBreak.call(this, parent, e);
            }
            //TODO: widgets
            //$.each(this.widgets, (function(_this) {
            //    return function(w) {
            //        if (w.handleEnterKey) {
            //            return w.handleEnterKey(e, parent);
            //        }
            //    };
            //})(this));
            if (parent.hasClass("graf--mixtapeEmbed") || parent.hasClass("graf--iframe") || parent.hasClass("graf--figure")) {
                if (!Utils.isLastChar(Utils.getEditorNode(getContentElement()[0]))) {
                    return false;
                }
            }
            if (parent.hasClass("graf--iframe") || parent.hasClass("graf--figure")) {
                if (Utils.isLastChar(Utils.getEditorNode(getContentElement()[0]))) {
                    handleLineBreakWith("p", parent);
                    Utils.setRangeAtText($(".is-selected")[0]);
                    $(".is-selected").trigger("mouseup");
                    return false;
                } else {
                    return false;
                }
            }
            components.tooltip_view.cleanOperationClasses($(anchor_node));
            if (anchor_node && components.editor_menu.reg.lineBreak.test(anchor_node.nodeName)) {
                if (Utils.isLastChar(Utils.getEditorNode(getContentElement()[0]))) {
                    e.preventDefault();
                    handleLineBreakWith("p", parent);
                }
            }
            setTimeout((function (_this) {
                return function () {
                    var node;
                    node = Utils.getEditorNode(getContentElement()[0]);
                    if (typeof node === "undefined") {
                        return;
                    }
                    Utils.setUniqueElementName($(node));
                    if (node.nodeName.toLowerCase() === "div") {
                        node = replaceWith("p", $(node))[0];
                    }
                    markAsSelected.call(_this, $(node));
                    setupFirstAndLast();
                    if (!$(node).text().trim()) {
                        $(node).children().each(function (i, n) {
                            return $(n).remove();
                        });
                        $(node).append("<br>");
                    }
                    return displayTooltipAt($(_this.el).find(".is-selected"));
                };
            })(this), 2);
        };

        var handleArrowForKeyDown = function (e) {
            var caret_node, current_node, ev_type, n, next_node, num, prev_node;
            caret_node = Utils.getEditorNode(getContentElement()[0]);
            current_node = $(caret_node);
            ev_type = e.originalEvent.key || e.originalEvent.keyIdentifier;
            switch (ev_type) {
                case "Down":
                    if (typeof current_node === "undefined" || !(current_node.length > 0)) {
                        var selectedTextElement = properties.el.find(".is-selected");
                        if (selectedTextElement.length > 0) {
                            current_node = selectedTextElement;
                        }
                    }
                    next_node = current_node.next();
                    if (!$(current_node).hasClass("graf")) {
                        return;
                    }
                    if (!(current_node.hasClass("graf--figure") || Utils.editableCaretOnLastLine($(current_node)))) {
                        return;
                    }
                    if (next_node.hasClass("graf--figure") && caret_node) {
                        n = next_node.find(".imageCaption");
                        scrollTo(n);
                        this.skip_keyup = true;
                        Utils.getSelection().removeAllRanges();
                        markAsSelected.call(this, next_node);
                        next_node.addClass("is-mediaFocused is-selected");
                        return false;
                    } else if (next_node.hasClass("graf--mixtapeEmbed")) {
                        n = current_node.next(".graf--mixtapeEmbed");
                        num = n[0].childNodes.length;
                        setRangeAt(n[0], num);
                        scrollTo(n);
                        return false;
                    }
                    if (current_node.hasClass("graf--figure") && next_node.hasClass("graf")) {
                        scrollTo(next_node);
                        markAsSelected.call(this, next_node);
                        setRangeAt(next_node[0]);
                        return false;
                    }
                    break;
                case "Up":
                    prev_node = current_node.prev();
                    if (!$(current_node).hasClass("graf")) {
                        return;
                    }
                    if (!Utils.editableCaretOnFirstLine($(current_node))) {
                        return;
                    }
                    if (prev_node.hasClass("graf--figure")) {
                        n = prev_node.find(".imageCaption");
                        scrollTo(n);
                        this.skip_keyup = true;
                        Utils.getSelection().removeAllRanges();
                        markAsSelected.call(this, prev_node);
                        prev_node.addClass("is-mediaFocused");
                        return false;
                    } else if (prev_node.hasClass("graf--mixtapeEmbed")) {
                        n = current_node.prev(".graf--mixtapeEmbed");
                        num = n[0].childNodes.length;
                        setRangeAt(n[0], num);
                        scrollTo(n);
                        return false;
                    }
                    if (current_node.hasClass("graf--figure") && prev_node.hasClass("graf")) {
                        setRangeAt(prev_node[0]);
                        scrollTo(prev_node);
                        return false;
                    } else if (prev_node.hasClass("graf")) {
                        n = current_node.prev(".graf");
                        num = n[0].childNodes.length;
                        scrollTo(n);
                        this.skip_keyup = true;
                        markAsSelected.call(this, prev_node);
                        return false;
                    }
            }
        };

        var handleArrow = function () {
            var current_node;
            current_node = $(Utils.getEditorNode(getContentElement()[0]));
            if (current_node.length > 0) {
                markAsSelected.call(this, current_node);
                return displayTooltipAt(current_node);
            }
        };

        /*
         This is a rare hack only for FF (I hope),
         when there is no range it creates a new element as a placeholder,
         then finds previous element from that placeholder,
         then it focus the prev and removes the placeholder.
         a nasty nasty one...
         */
        var handleNullAnchor = function () {
            var node, num, prev, range, sel, span;
            sel = Utils.getSelection();
            if (sel.isCollapsed && sel.rangeCount > 0) {
                range = sel.getRangeAt(0);
                span = $(baseParagraphTmpl())[0];
                range.insertNode(span);
                range.setStart(span, 0);
                range.setEnd(span, 0);
                sel.removeAllRanges();
                sel.addRange(range);
                node = $(range.commonAncestorContainer);
                prev = node.prev();
                num = prev[0].childNodes.length;
                if (prev.hasClass("graf") || prev.hasClass("graf--mixtapeEmbed")) {
                    setRangeAt(prev[0], num);
                    node.remove();
                    markAsSelected.call(this, Utils.getEditorNode(getContentElement()[0]));
                } else if (prev.hasClass("postList")) {
                    setRangeAt(prev.find("li").last()[0]);
                } else if (!prev) {
                    setRangeAt(properties.el.find(".section-inner p")[0]);
                }
                return displayTooltipAt(properties.el.find(".is-selected"));
            }
        };

        var handleImmediateDeletion = function (element) {
            var new_node = $(baseParagraphTmpl()).insertBefore($(element));
            new_node.addClass("is-selected");
            setRangeAt($(element).prev()[0]);
            return $(element).remove();
        };

        var handleCompleteDeletion = function (element) {
            if (!!$(element).text().trim()) {
                Utils.getSelection().removeAllRanges();
                render(); //re-render
                setTimeout(function () {
                    return setRangeAt(properties.el.find(".section-inner p")[0]);
                }, 20);
                return true;
            }

            return false;
        };

        /* Event listeners */

        var handleMouseUp = function () {
            var anchor_node = Utils.getEditorNode(getContentElement()[0]);
            if (!anchor_node) {
                return;
            }
            this.prev_current_node = anchor_node;
            handleTextSelection(anchor_node);
            hidePlaceholder(anchor_node);
            markAsSelected.call(this, anchor_node);
            return displayTooltipAt(anchor_node);
        };

        var handleKeyDown = function (e) {
            var anchor_node, eventHandled, parent, utils_anchor_node, selectedTextElement;
            anchor_node = Utils.getEditorNode(getContentElement()[0]);
            parent = $(anchor_node);
            if (anchor_node) {
                markAsSelected.call(this, anchor_node);
            }
            if (e.which === keys.TAB) {
                handleTab.call(this, anchor_node);
                return false;
            }
            if (e.which === keys.ENTER) {
                handleEnter.call(this, anchor_node, e);
            }
            if (e.which === keys.BACKSPACE) {
                eventHandled = false;
                components.tooltip_view.hide();
                if (this.reachedTop && Utils.isFirstChar(Utils.getEditorNode(getContentElement()[0]))) {
                    return false;
                }
                anchor_node = Utils.getEditorNode(getContentElement()[0]);
                utils_anchor_node = Utils.getNode();
                //TODO: widgets
                //$.each(this.widgets, (function(_this) {
                //    return function(w) {
                //        if (_.isFunction(w.handleBackspaceKey) && !eventHandled) {
                //            eventHandled = w.handleBackspaceKey(e, anchor_node);
                //            return utils.log(eventHandled);
                //        }
                //    };
                //})(this));
                if (eventHandled) {
                    e.preventDefault();
                    return false;
                }
                if (parent.hasClass("graf--li") && Utils.getCharacterPrecedingCaret(Utils.getEditorNode(getContentElement()[0])).length === 0) {
                    return handleListBackspace(parent, e);
                }
                if ($(anchor_node).hasClass("graf--p") && Utils.isFirstChar(Utils.getEditorNode(getContentElement()[0]))) {
                    if ($(anchor_node).prev().hasClass("graf--figure") && getSelectedText().length === 0) {
                        e.preventDefault();
                        $(anchor_node).prev().find("img").click();
                    }
                }
                if ($(utils_anchor_node).hasClass("section-content") || $(utils_anchor_node).hasClass("graf--first")) {
                    if (!$(utils_anchor_node).text()) {
                        return false;
                    }
                }
                if ($(anchor_node).hasClass("graf--mixtapeEmbed") || $(anchor_node).hasClass("graf--iframe")) {
                    if (!$(anchor_node).text().trim() || Utils.isFirstChar(Utils.getEditorNode(getContentElement()[0]))) {
                        if (isSelectingAll(anchor_node)) {
                            handleImmediateDeletion($(anchor_node));
                        }
                        return false;
                    }
                }
                if ($(anchor_node).prev().hasClass("graf--mixtapeEmbed")) {
                    if (Utils.isFirstChar(Utils.getEditorNode(getContentElement()[0])) && !!$(anchor_node).text().trim()) {
                        return false;
                    }
                }
            }
            if (e.which === keys.SPACEBAR) {
                if (parent.hasClass("graf--p")) {
                    handleSmartList(parent, e);
                }
            }
            if ($.inArray(e.which, [keys.UPARROW, keys.DOWNARROW])) {
                handleArrowForKeyDown.call(this, e);
            }
            if (anchor_node) {
                if (!!($(anchor_node).text())) {
                    components.tooltip_view.hide();
                    $(anchor_node).removeClass("graf--empty");
                }
            }
            selectedTextElement = properties.el.find(".is-selected");
            if (typeof anchor_node === "undefined" && selectedTextElement.hasClass("is-mediaFocused")) {
                setRangeAt(selectedTextElement.find("figcaption")[0]);
                selectedTextElement.removeClass("is-mediaFocused");
                return false;
            }
        };

        var handleKeyUp = function (e) {
            var anchor_node, next_graf, utils_anchor_node;
            if (this.skip_keyup) {
                return this.skip_keyup = false;
            }
            components.editor_menu.hide();
            this.reachedTop = false;
            anchor_node = Utils.getEditorNode(getContentElement()[0]);
            utils_anchor_node = Utils.getNode();
            handleTextSelection(anchor_node);
            if ($.inArray(e.which, [keys.BACKSPACE, keys.SPACEBAR, keys.ENTER])) {
                if ($(anchor_node).hasClass("graf--li")) {
                    removeSpanTag($(anchor_node));
                }
            }
            if (e.which === keys.BACKSPACE) {
                if ($(utils_anchor_node).hasClass("postField--body")) {
                    if (handleCompleteDeletion(properties.el)) {
                        return false;
                    }
                }
                if ($(utils_anchor_node).hasClass("section-content") || $(utils_anchor_node).hasClass("graf--first")) {
                    if (!!$(utils_anchor_node).text()) {
                        next_graf = $(utils_anchor_node).next(".graf")[0];
                        if (next_graf) {
                            setRangeAt(next_graf);
                            $(utils_anchor_node).remove();
                            setupFirstAndLast();
                        }
                        return false;
                    }
                }
                if (!anchor_node) {
                    handleNullAnchor.call(this);
                    return false;
                }
                if ($(anchor_node).hasClass("graf--first")) {
                    var node = Utils.getEditorNode(getContentElement()[0]);
                    if (getSelectedText() === node.textContent) {
                        node.innerHTML = "<br>";
                    }
                    markAsSelected.call(this, anchor_node);
                    setupFirstAndLast();
                    return false;
                }
            }
            if ($.inArray(e.which, [keys.LEFTARROW, keys.UPARROW, keys.RIGHTARROW, keys.DOWNARROW])) {
                return handleArrow.call(this, e);
            }
        };

        var handleDblclick = function () {
            var node = Utils.getEditorNode(getContentElement()[0]);
            if (!node) {
                setRangeAt(this.prev_current_node);
            }
            return false;
        };

        var events = {
            "mouseup": handleMouseUp,
            "keydown": handleKeyDown,
            "keyup": handleKeyUp,
            "dblclick": handleDblclick,
            //"paste": "handlePaste",
            //"dragstart": "handleDrag",
            //"drop": "handleDrag",
            //"click .graf--figure .aspectRatioPlaceholder": "handleGrafFigureSelectImg",
            //"click .graf--figure figcaption": "handleGrafFigureSelectCaption",
            //"mouseover .graf--figure.graf--iframe": "handleGrafFigureSelectIframe",
            //"mouseleave .graf--figure.graf--iframe": "handleGrafFigureUnSelectIframe",
            //"keyup .graf--figure figcaption": "handleGrafCaptionTyping",
            //"mouseover .markup--anchor": "displayPopOver",
            //"mouseout  .markup--anchor": "hidePopOver"
        };

        /* END Event listeners */

        /**
         * Public Editor object extends View
         * @public
         */

        /**
         * Retrieve the element that contains the editor content.
         * @returns {*}
         */
        var getContentElement = function () {
            return properties.el.find(".section-inner");
        };

        /**
         * Retrieve the sanitized element contents for use in the editor.
         * @param element
         * @returns {*}
         */
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

        /**
         * Prepare an element for the editor by adding the appropriate classes.
         * @param element
         * @returns {*}
         */
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
                        Utils.setUniqueElementName(n);
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
                    $(n).removeClass().addClass("postList");
                    $(n).find("li").each(function (i, li) {
                        return $(li).removeClass().addClass("graf graf--li");
                    });
                    break;
                case "img":
                    //this.uploader_widget.uploadExistentImage(n); TODO: uploader widget
                    break;
                case "a":
                case 'strong':
                case 'em':
                case 'br':
                case 'b':
                case 'u':
                case 'i':
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

        /**
         * Perform the appropriate editor behaviours (e.g. display/hide menu) on text selection,
         * given the provided anchor node.
         * @param anchor_node The anchor node within which the current editor selection has been made.
         */
        var handleTextSelection = function (anchor_node) {
            var text;
            components.editor_menu.hide();
            text = getSelectedText();
            if (!$(anchor_node).is(".graf--mixtapeEmbed, .graf--figure") && text.trim()) {
                return displayMenu();
            }
        };

        /**
         * Set up the elements for use as a link in the editor.
         * @param elems
         */
        var setupLinks = function (elems) {
            elems.each(elems, function (i, link) {
                setupLink(link);
            });
        };

        prepareProperties.apply(null, arguments);
        var editor = Utils.extend(Object.create(View(properties, events)), {
            /**
             * Evoke a store action
             */
            store: function () {
                store.call(this);
            },
            getContent: function () {
                return this.getContentElement().html();
            },
            getContentElement: function () {
                return getContentElement();
            },
            cleanContents: function (element) {
                return cleanContents(element);
            },
            addClassesToElement: function (element) {
                return addClassesToElement(element);
            },
            setupLinks: function (elems) {
                return setupLinks(elems);
            },
            handleTextSelection: function (anchor_node) {
                return handleTextSelection(anchor_node);
            },
        });

        return init.call(editor);
    }
})();