(function () {
    'use strict';

    /**
     * This is the default schema/model definition for a User.
     * Feel free to modify it!
     */

    var mongoose = require('mongoose');

    var validateEmail = function(email) {
        var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return re.test(email)
    };

    var userSchema = new mongoose.Schema({
        name: {
            first: {type: String, trim: true, required: 'First name is required'},
            last: {type: String, trim: true, required: 'Last name is required'}
        },
        password: {
            type: String,
            trim: true,
            required: 'Password is required'
        },
        username: {
            type: String,
            trim: true,
            unique: true,
            required: 'Username is required'
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            required: 'Email address is required',
            validate: [validateEmail, 'Please fill a valid email address'],
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        }
    });

    module.exports = mongoose.model('Users', userSchema);
})();