/*
 User route page
*/
const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/sign-in', userController.signIn);
router.post('/sign-up', userController.signUp);
router.get('/sign-out', userController.signOut);
router.get('/register', userController.register);
router.get('/login', userController.login);

module.exports = router;