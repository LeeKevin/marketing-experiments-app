(function () {
    var extend;

    module.exports = function () {
        /**
         * @private
         */
        var init = function (options) {
            if (options == null) {
                options = {};
            }
            if (options.el) {
                this.el = options.el;
            }
            this._ensureElement();
            this._ensureEvents();
        }

        /**
         * Public View object
         * @public
         */
        var view = {
            events: function () {
                return;
            },
            render: function () {
                return this;
            },
            remove: function () {
                this._removeElement();
                //this.stopListening();
                return this;
            },
            _removeElement: function () {
                return this.$el.remove();
            },
            setElement: function (element) {
                this._setElement(element);
                return this;
            },
            setEvent: function (opts) {
                if (!_.isEmpty(opts)) {
                    return _.each(opts, (function (_this) {
                        return function (f, key) {
                            var element, func, key_arr;
                            key_arr = key.split(" ");
                            if (_.isFunction(f)) {
                                func = f;
                            } else if (_.isString(f)) {
                                func = _this[f];
                            } else {
                                throw "error event needs a function or string";
                            }
                            element = key_arr.length > 1 ? key_arr.splice(1, 3).join(" ") : null;
                            return $(_this.el).on(key_arr[0], element, _.bind(func, _this));
                        };
                    })(this));
                }
            },
            _ensureElement: function () {
                return this.setElement(_.result(this, 'el'));
            },
            _ensureEvents: function () {
                return this.setEvent(_.result(this, 'events'));
            },
            _setElement: function (el) {
                this.$el = el instanceof $ ? el : $(el);
                return this.el = this.$el[0];
            }
        };

        init.apply(view, arguments);
        return view;
    };

    extend = function (protoProps, staticProps) {
        var Surrogate, child, parent;
        parent = this;
        child = void 0;
        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () {
                return parent.apply(this, arguments);
            };
        }
        _.extend(child, parent, staticProps);
        Surrogate = function () {
            this.constructor = child;
        };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;
        if (protoProps) {
            _.extend(child.prototype, protoProps);
        }
        child.__super__ = parent.prototype;
        return child;
    };
})();