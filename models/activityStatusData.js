/**
 * This code defines a mongoose schema and model for activity status data.
 * The schema includes fields for status date and status.
 */

const mongoose = require("mongoose");

const activityStatusDataSchema = new mongoose.Schema({
        statusDt: {
            type: Date,
            required: true
        },
        status: {
            type: String,
        }
});

const activityStatusDataModel = mongoose.model("ActivityStatusDatas", activityStatusDataSchema);

module.exports = activityStatusDataModel;