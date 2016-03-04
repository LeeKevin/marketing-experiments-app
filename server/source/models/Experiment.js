(function () {
    'use strict';

    /**
     * This is the default schema/model definition for a User.
     * Feel free to modify it!
     */

    var mongoose = require('mongoose');

    var ExperimentSchema = new mongoose.Schema({
        title: {
            type: String,
            trim: true,
            required: 'Title is required'
        },
        metric: {
            type: String,
            trim: true,
            required: 'Success metric is required'
        },
        goal: {
            type: Number,
            required: 'Growth goal is required'
        },
        result: {
            type: Number,
            required: 'Growth result is required'
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: 'Author is required'
        },
        file_id: {
            type: mongoose.Schema.Types.ObjectId,
            unique: true,
            required: 'File ID is required'
        }
    }, {timestamps: true});

    module.exports = mongoose.model('Experiments', ExperimentSchema);
})();