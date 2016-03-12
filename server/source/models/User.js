(function () {
    'use strict';

    /**
     * This is the default schema/model definition for a User.
     * Feel free to modify it!
     */

    var mongoose = require('mongoose'),
        bcrypt = require('bcrypt'),
        SALT_WORK_FACTOR = 10;

    var validateEmail = function (email) {
        var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return re.test(email)
    };

    var UserSchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true,
            required: 'Name is required'
        },
        local: {
            password: {
                type: String
            },
        },
        twitter: {
            id: {
                type: String,
                unique: true,
            },
            username: {
                type: String,
            }
        },
        facebook: {
            id: {
                type: String,
                unique: true,
            },
            token: {
                type: String,
            }
        },
        username: {
            type: String,
            trim: true,
            unique: true,
            required: 'Username is required',
            match: [/^[A-Za-z0-9_-]*$/, 'Username must only contain alphanumeric characters, underscores (_), and dashes (-).']
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

    var methods = {
        //Use to test passwords against the actual hashed password
        checkPassword: function (candidatePassword) {
            return bcrypt.compareSync(candidatePassword, this.local.password);
        },
    };

    UserSchema.pre('save', function (next) {
        var user = this;
        // only hash the password if it has been modified (or is new)
        if (!user.isModified('local.password')) return next();

        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err) return next(err);

            // hash the password along with our new salt
            bcrypt.hash(user.local.password, salt, function (err, hash) {
                if (err) return next(err);

                // override the cleartext password with the hashed one
                user.password = hash;
                return next();
            });
        });
    });

    UserSchema.methods = methods;
    module.exports = mongoose.model('Users', UserSchema);
})();