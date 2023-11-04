const Activity = require("../models/activity");
const User = require("../models/user");
const ActivityStatusData = require("../models/activityStatusData");
const { ObjectId, default: mongoose } = require("mongoose");

/**
 * This code retrieves the current activity for a user.
 * It fetches the user's activities from the database, filters them based on a specific date range,
 * and sorts them in descending order of creation date.
 */
module.exports.currActivity = async function (req, res) {
  const user = req.user;
  try {
    const userFound = await User.findOne({ email: user.email });
    if (userFound) {
      let activities;
      try {
        activities = await Activity.find({ user: userFound.id })
          .sort({ createdAt: -1 })
          .populate("statusData")
          .populate("user");
      } catch (err) {
        console.log("Error while fetching activities - ", err);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }

      let currentDate = new Date();
      let pastWeek = new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000);

      activities = activities.map((activity) => {
        activity.statusData.sort((dt1, dt2) => {
          return (
            new Date(dt2.statusDt).getTime() - new Date(dt1.statusDt).getTime()
          );
        });
        activity.statusData = activity.statusData.filter(function (temp) {
          temp.statusDt = new Date(temp.statusDt);
          return (
            temp.statusDt.getTime() >= pastWeek.getTime() &&
            temp.statusDt.getTime() <= currentDate.getTime()
          );
        });
        return activity;
      });
      return res.render("currActivity", {
        title: "Current Activity",
        activities: activities,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (err) {
    console.log("Error in finding user - ", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/*
This code fetches and displays the weekly activities for a user, filtering them based on the past week's date range. It retrieves the user information, searches for the user in the database, fetches the activities, sorts and filters them, and renders the view with the fetched activities.
*/
module.exports.weeklyActivity = async function (req, res) {
  const user = req.user;
  try {
    const userFound = await User.findOne({ email: user.email });

    if (userFound) {
      try {
        let activities = await Activity.find({ user: userFound.id })
          .sort({ createdAt: -1 })
          .populate("statusData")
          .populate("user");
        let currentDate = new Date();
        let pastWeek = new Date(
          currentDate.getTime() - 6 * 24 * 60 * 60 * 1000
        );
        activities = activities.map((activity) => {
          activity.statusData.sort((dt1, dt2) => {
            return (
              new Date(dt2.statusDt).getTime() -
              new Date(dt1.statusDt).getTime()
            );
          });
          activity.statusData = activity.statusData.filter(function (temp) {
            temp.statusDt = new Date(temp.statusDt);
            return (
              temp.statusDt.getTime() >= pastWeek.getTime() &&
              temp.statusDt.getTime() <= currentDate.getTime()
            );
          });
          return activity;
        });
        return res.render("weeklyActivity", {
          title: "Weekly Activity",
          activities: activities,
        });
      } catch (err) {
        console.log("Error in getting activities - ", err);
        return res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (err) {
    console.log("Error in finding user - ", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * It extracts the required data from the request body and checks if a status data ID (stDtId) is provided.
 * If stDtId is not provided, it creates a new status data entry and updates the activity with the new status data ID.
 * If stDtId is provided, it updates the existing status data entry with the new status.
 * The function returns a JSON response indicating the success or failure of the update operation.
 */
module.exports.updateStatusById = async function (req, res) {
  let { activityid, stDtId, status, day } = req.body;
  if (!stDtId) {
    let currDate = new Date();
    let statusData;
    let newStatusData = new ActivityStatusData({
      statusDt: currDate.setDate(currDate.getDate() - day),
      status: status,
    });
    try {
      statusData = await newStatusData.save();
    } catch (err) {
      console.log("Error while creating status data - ", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
    try {
      const activityData1 = await Activity.findOne({
        _id: new mongoose.Types.ObjectId(activityid),
      });
      let tempstatusData = activityData1.statusData;
      tempstatusData.push(statusData.id);
      const activityData2 = await Activity.updateOne(
        { _id: activityid },
        { statusData: tempstatusData }
      );
      return res.status(200).json({
        success: true,
        message: "ActivityData updated successfully",
      });
    } catch (err) {
      console.log("Error updating activity -", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  } else {
    try {
      const activityData = await ActivityStatusData.updateOne(
        {
          _id: new mongoose.Types.ObjectId(stDtId),
        },
        { status: status }
      );
      return res.status(200).json({
        success: true,
        message: "ActivityData updated successfully",
      });
    } catch (err) {
      console.log("Error while updating activityData status - ", err);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
};

/**
 * Creates a new activity for a user.
 * 
 * It extracts the name from the request body,
 * creates a new activity with the provided name, and saves it to the database. It then updates the activities
 * array of the user associated with the request by adding the ID of the newly created activity. Finally, it
 * redirects the user to the "current activity" page.
 */
module.exports.createActivity = async function (req, res) {
  let user = req.user;
  console.log(user);

  const { name } = req.body;
  const currDate = new Date();
  const newActivity = new Activity({
    name: name,
    statusData: [],
    createdAt: currDate,
    user: user.userId,
  });
  try {
    const activity = await newActivity.save();
    try {
      const existinguser = await User.findOne({ email: user.email });
      if (existinguser) {
        let activities = existinguser.activities;
        activities.push(activity.id);
        await User.updateOne({ email: user.email }, { activities: activities });
      } else {
        return res.status(500).json({
          success: false,
          message: "User not found",
        });
      }
    } catch (err) {
      console.log("Error while finding or  updating user - ", err);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  } catch (err) {
    console.log("Error while creating activity - ", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }

  return res.redirect("/activity");
};
