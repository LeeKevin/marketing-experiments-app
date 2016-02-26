(function () {
    'use strict';

    /**
     * This is the default schema/model definition for a User.
     * Feel free to modify it!
     */

    var mongoose = require('mongoose'),
        config = require('../../config/app')['auth'],
        expiresIn = config['options']['expiresIn'] || 0,
        UserSessionSchema,
        statics;

    UserSessionSchema = new mongoose.Schema({
        activity: {type: Date, expires: expiresIn, default: Date.now},
        access_token: {type: String, required: true}
    });

    statics = {
        get: function (token, callback) {
            return this.findOne({access_token: token}, callback);
        },
        store: function (token, callback) {
            (new this({access_token: token})).save(callback);
        },
        invalidate: function (token) {
            this.findOne({access_token: token}).remove();
        }
    };

    UserSessionSchema.statics = statics;

    module.exports = mongoose.model('UserSessions', UserSessionSchema);
})();