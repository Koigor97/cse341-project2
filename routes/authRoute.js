const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

//*************************** ROUTES ****************** */

/**
 * * using the route method from express.Router()
 * * function to define and chain route handlers
 */

router.get('/login', authController.renderLogin);

router.get('/signup', authController.renderSignup);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/auth/github/callback',
  passport.authenticate('github', { session: false }),
  authController.githubAuthCallback
);

// forgot password and reset password routes

router.post('/forgotPassword', authController.forgotPassword);
router.put('/resetPassword/:token', authController.resetPassword);

module.exports = router;
