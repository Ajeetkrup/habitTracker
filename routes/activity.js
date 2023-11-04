/*
 Activity route 
*/
const express = require('express');
const activityController = require("../controllers/activityController");
const auth = require("../middlewares/auth");

const router = express.Router();

router.get('/', auth, activityController.currActivity);
router.post('/create', auth, activityController.createActivity);
router.post('/statusUpdateById', auth, activityController.updateStatusById);
router.get('/weekly', auth, activityController.weeklyActivity);

module.exports = router;