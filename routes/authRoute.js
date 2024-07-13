const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

//*************************** ROUTES ****************** */

/**
 * * using the route method from express.Router()
 * * function to define and chain route handlers
 */

//* authentication pages routes

router.get('/login', authController.renderLogin);
router.get('/signup', authController.renderSignup);

//* authentication routes
router.post('/signup', authController.signup, (req, res) => {
  res.redirect('/login');
});
router.post('/login', authController.login, (req, res) => {
  res.redirect('/api-docs');
});
router.get('/logout', authController.logout, (req, res) => {
  res.redirect('/');
});

//* github authentication routes
router.get(
  '/loginWithGithub',
  passport.authenticate('github', { scope: ['user:email'] })
);
router.get(
  '/auth',
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/login'
  }),
  authController.githubAuthCallback
);

//* google authentication routes
router.get(
  '/loginWithGoogle',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login'
  }),
  authController.googleAuthCallback
);

//* forgot password and reset password routes

router.post('/forgotPassword', authController.forgotPassword);
router.put('/resetPassword/:token', authController.resetPassword);

module.exports = router;
