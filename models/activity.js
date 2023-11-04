/**
 * This file defines the activity schema and model for the MongoDB database.
 * The activity schema contains fields such as name, statusData, createdAt, and user.
 * It also establishes the relationships with user and activitystatusdata models using object references.
 */

const mongoose = require("mongoose");

// Define the activity schema
const activitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    statusData: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ActivityStatusDatas'
    }],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Create the activity model
const activityModel = mongoose.model("Activity", activitySchema);

// Export the activity model
module.exports = activityModel;