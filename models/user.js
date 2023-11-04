/**
 * This code defines a mongoose schema for a user. The schema includes fields for name, email, password, and activities.
 * The email and password fields have validation rules to ensure they meet certain criteria.
 * The activities field is an array of references to activity documents.
 */
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: '{VALUE} is not a valid email!'
          }      
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/.test(v);
            },
            message: "Minimum eight characters, at least one uppercase letter, one lowercase letter and one number!"
        }
    },
    activities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
    }],
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;