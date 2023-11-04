/*
 Main route page
*/
const express = require('express');
const homeController = require('../controllers/homeController');
const auth = require("../middlewares/auth")
const router = express.Router();

router.get('/' , auth, homeController.home);
router.use('/user',require('./user'));
router.use('/activity', require('./activity'));

module.exports = router;