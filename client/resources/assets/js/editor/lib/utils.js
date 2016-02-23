'use strict';

/**
 * Module dependencies.
 */
var $ = require('jquery');

/**
 * Module variables.
 * @private
 */

var LINE_HEIGHT = 20;


/**
 * Module exports.
 * @public
 */

module.exports = {
    log: function (message) {
        return console.log(message);
    },
    getBase64Image: function (img) {
        var canvas, ctx, dataURL;
        canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        dataURL = canvas.toDataURL("image/png");
        return dataURL;
    },
    generateUniqueName: function () {
        return Math.random().toString(36).slice(8);
    },
    saveSelection: function () {
        var i, len, ranges, sel;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                ranges = [];
                i = 0;
                len = sel.rangeCount;
                while (i < len) {
                    ranges.push(sel.getRangeAt(i));
                    ++i;
                }
                return ranges;
            }
        } else {
            if (document.selection && document.selection.createRange) {
                return document.selection.createRange();
            }
        }
        return null;
    },
    restoreSelection: function (savedSel) {
        var i, len, sel;
        if (savedSel) {
            if (window.getSelection) {
                sel = window.getSelection();
                sel.removeAllRanges();
                i = 0;
                len = savedSel.length;
                while (i < len) {
                    sel.addRange(savedSel[i]);
                    ++i;
                }
            } else {
                if (document.selection && savedSel.select) {
                    savedSel.select();
                }
            }
        }
    },
    getSelection: function () {
        if (window.getSelection) {
            return window.getSelection();
        } else if (document.selection && document.selection.type !== "Control") {
            return document.selection;
        }
    },
    getNode: function () {
        var container, range, sel;
        range = void 0;
        sel = void 0;
        container = void 0;
        if (document.selection && document.selection.createRange) {
            range = document.selection.createRange();
            return range.parentElement();
        } else if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt) {
                if (sel.rangeCount > 0) {
                    range = sel.getRangeAt(0);
                }
            } else {
                range = document.createRange();
                range.setStart(sel.anchorNode, sel.anchorOffset);
                range.setEnd(sel.focusNode, sel.focusOffset);
                if (range.collapsed !== sel.isCollapsed) {
                    range.setStart(sel.focusNode, sel.focusOffset);
                    range.setEnd(sel.anchorNode, sel.anchorOffset);
                }
            }
            if (range) {
                container = range.commonAncestorContainer;
                if (container.nodeType === 3) {
                    return container.parentNode;
                } else {
                    return container;
                }
            }
        }
    },
    getEditorNode: function (root) {
        var node, selection, range;
        if (root instanceof $) root = root[0];
        selection = this.getSelection();
        if (selection.rangeCount < 1) {
            return;
        }
        range = selection.getRangeAt(0);
        node = range.commonAncestorContainer;
        if (!node || node === root) {
            return null;
        }
        while (node && (node.nodeType !== 1 || !$(node).hasClass("graf")) && (node.parentNode !== root)) {
            node = node.parentNode;
        }
        if (!$(node).hasClass("graf--li")) {
            while (node && (node.parentNode !== root)) {
                node = node.parentNode;
            }
        }
        if (root && root.contains(node)) {
            return node;
        } else {
            return null;
        }
    },
    setUniqueElementName: function (element) {
        if (!(element instanceof $)) element = $(element);
        return element.attr("name", this.generateUniqueName());
    },
    getSelectionDimensions: function () {
        var height, left, range, rect, sel, top, width;
        sel = document.selection;
        range = void 0;
        width = 0;
        height = 0;
        left = 0;
        top = 0;
        if (sel) {
            if (sel.type !== "Control") {
                range = sel.createRange();
                width = range.boundingWidth;
                height = range.boundingHeight;
            }
        } else if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0).cloneRange();
                if (range.getBoundingClientRect) {
                    rect = range.getBoundingClientRect();
                    width = rect.right - rect.left;
                    height = rect.bottom - rect.top;
                }
            }
        }
        return {
            width: width,
            height: height,
            top: rect.top,
            left: rect.left
        };
    },
    getCaretPosition: function (editableDiv) {
        var caretPos, containerEl, range, sel, tempEl, tempRange;
        caretPos = 0;
        containerEl = null;
        sel = void 0;
        range = void 0;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0);
                if (range.commonAncestorContainer.parentNode === editableDiv) {
                    caretPos = range.endOffset;
                }
            }
        } else if (document.selection && document.selection.createRange) {
            range = document.selection.createRange();
            if (range.parentElement() === editableDiv) {
                tempEl = document.createElement("span");
                editableDiv.insertBefore(tempEl, editableDiv.firstChild);
                tempRange = range.duplicate();
                tempRange.moveToElementText(tempEl);
                tempRange.setEndPoint("EndToEnd", range);
                caretPos = tempRange.text.length;
            }
        }
        return caretPos;
    },
    getCharacterPrecedingCaret: function (node) {
        var precedingChar, precedingRange, range, sel;
        precedingChar = "";
        sel = void 0;
        range = void 0;
        precedingRange = void 0;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount > 0) {
                range = sel.getRangeAt(0).cloneRange();
                range.collapse(true);
                range.setStart(node, 0);
                precedingChar = range.toString().slice(0);
            }
        } else if ((sel = document.selection) && sel.type !== "Control") {
            range = sel.createRange();
            precedingRange = range.duplicate();
            precedingRange.setEndPoint("EndToStart", range);
            precedingChar = precedingRange.text.slice(0);
        }
        return precedingChar;
    },
    isLastChar: function (node) {
        return $(node).text().trim().length === this.getCharacterPrecedingCaret(node).trim().length;
    },
    isFirstChar: function (node) {
        return this.getCharacterPrecedingCaret(node).trim().length === 0;
    },
    setRangeAtText: function (element, pos) {
        var node, range, sel;
        if (pos == null) {
            pos = 0;
        }
        range = document.createRange();
        sel = window.getSelection();
        node = element.firstChild;
        range.setStart(node, 0);
        range.setEnd(node, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return element.focus();
    },
    isElementInViewport: function (el) {
        var rect;
        if (typeof $ === "function" && el instanceof $) {
            el = el[0];
        }
        rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
    },
    editableIsCaret: function () {
        return window.getSelection().type === 'Caret';
    },
    editableRange: function () {
        var sel;
        sel = window.getSelection();
        if (!(sel.rangeCount > 0)) {
            return;
        }
        return sel.getRangeAt(0);
    },
    extend: function (base, extension) {
        var __hasProp = {}.hasOwnProperty;

        for (var key in extension) {
            if (__hasProp.call(extension, key)) base[key] = extension[key];
        }
        return base;
    },
    /**
     * Passes a function without execution (i.e. by reference) and sets the this value.
     * This redefines the scope of the function without calling it.
     *
     * @param func
     * @param thisArg
     * @returns {Function}
     */
    scope: function (func, thisArg) {
        return function () {
            return func.apply(thisArg, arguments);
        };
    },
    killWhiteSpace: function (str) {
        return str.replace(/\s/g, '');
    },
    /**
     *
     * @param element - jQuery element
     * @returns {boolean}
     */
    editableCaretOnLastLine: function (element) {
        var cbtm, ebtm, range;
        range = this.editableRange();
        if (!range) {
            return false;
        }
        if (is_caret_at_end_of_node(element[0], range)) {
            return true;
        } else if (is_caret_at_start_of_node(element[0], range)) {
            cbtm = element[0].getBoundingClientRect().top + LINE_HEIGHT;
        } else {
            cbtm = range.getClientRects()[0].bottom;
        }
        ebtm = element[0].getBoundingClientRect().bottom;
        return cbtm > ebtm - LINE_HEIGHT;
    },
    /**
     *
     * @param element - jQuery element
     * @returns {boolean}
     */
    editableCaretOnFirstLine: function (element) {
        var ctop, etop, range;
        range = this.editableRange();
        if (!range) {
            return false;
        }
        if (is_caret_at_start_of_node(element[0], range)) {
            return true;
        } else if (is_caret_at_end_of_node(element[0], range)) {
            ctop = element[0].getBoundingClientRect().bottom - LINE_HEIGHT;
        } else {
            ctop = range.getClientRects()[0].top;
        }
        etop = element[0].getBoundingClientRect().top;
        return ctop < etop + LINE_HEIGHT;
    }
}

/**
 * Module methods
 * @private
 */

var is_caret_at_start_of_node = function (node, range) {
    var pre_range;
    pre_range = document.createRange();
    pre_range.selectNodeContents(node);
    pre_range.setEnd(range.startContainer, range.startOffset);
    return pre_range.toString().trim().length === 0;
};

var is_caret_at_end_of_node = function (node, range) {
    var post_range;
    post_range = document.createRange();
    post_range.selectNodeContents(node);
    post_range.setStart(range.endContainer, range.endOffset);
    return post_range.toString().trim().length === 0;
};
/*
 $.fn.editableCaretRange = function () {
 if (!this.editableIsCaret()) {
 return;
 }
 return this.editableRange();
 };

 $.fn.editableSetRange = function (range) {
 var sel;
 sel = window.getSelection();
 if (sel.rangeCount > 0) {
 sel.removeAllRanges();
 }
 return sel.addRange(range);
 };

 $.fn.editableFocus = function (at_start) {
 var range, sel;
 if (at_start == null) {
 at_start = true;
 }
 if (!this.attr('contenteditable')) {
 return;
 }
 sel = window.getSelection();
 if (sel.rangeCount > 0) {
 sel.removeAllRanges();
 }
 range = document.createRange();
 range.selectNodeContents(this[0]);
 range.collapse(at_start);
 return sel.addRange(range);
 };

 $.fn.editableCaretAtStart = function () {
 var range;
 range = this.editableRange();
 if (!range) {
 return false;
 }
 return is_caret_at_start_of_node(this[0], range);
 };

 $.fn.editableCaretAtEnd = function () {
 var range;
 range = this.editableRange();
 if (!range) {
 return false;
 }
 return is_caret_at_end_of_node(this[0], range);
 };

 */
