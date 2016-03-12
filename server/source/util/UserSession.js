(function () {
    'use strict';

    var mongoose = require('mongoose'),
        config = require('../../config/auth')['token'],
        expiresIn = config.options.expiresIn || 0,
        UserSessionSchema,
        statics,
        activity;

    activity = {
        type: Date,
        default: Date.now
    };
    if (expiresIn > 0) activity.expires = expiresIn;

    UserSessionSchema = new mongoose.Schema({
        activity: activity,
        access_token: {type: String, required: true},
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        }
    });

    statics = {
        get: function (token, callback) {
            return this.findOne({access_token: token}, callback);
        },
        store: function (token, id, callback) {
            (new this({access_token: token, user_id: id})).save(callback);
        },
        invalidate: function (token, callback) {
            this.findOne({access_token: token}).remove(callback);
        },
        invalidateByUser: function (id, callback) {
            var ObjectId = require('mongoose').Types.ObjectId;
            this.find({user_id: new ObjectId(id)}).remove(callback);
        }
    };

    UserSessionSchema.statics = statics;

    module.exports = mongoose.model('UserSessions', UserSessionSchema);
})();