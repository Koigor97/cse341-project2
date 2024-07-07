//* using express router to create modular, mountable route handlers
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');
const passport = require('passport');

//*************************** ROUTES ****************** */

/**
 * * using the route method from express.Router()
 * * function to define and chain route handlers
 */

//* authentication routes

router.get(
  '/loginWithGithub',
  passport.authenticate('github', { scope: ['user:email'] })
);
router.get(
  '/auth',
  passport.authenticate('github', {
    session: false,
    successRedirect: '/api-docs',
    failureRedirect: '/login'
  }),
  authController.githubAuthCallback
);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

//---------------------------------------------------------//

//* forgot password and reset password routes

router.post('/forgotPassword', authController.forgotPassword);
router.put('/resetPassword/:token', authController.resetPassword);
router.put(
  '/updatePassword',
  authController.isAuthenticated,
  authController.updatePassword
);

//---------------------------------------------------------//

//* user resource routes

router
  .route('/')
  .get(
    authController.isAuthenticated,
    authController.isAuthorized,
    usersController.getUsers
  )
  .post(
    authController.isAuthenticated,
    authController.isAuthorized,
    usersController.createUser
  );

router.put(
  '/updateMe',
  authController.isAuthenticated,
  usersController.updateMe
);

router.delete(
  '/deleteMe',
  authController.isAuthenticated,
  usersController.deleteMe
);

router
  .route('/:id')
  .get(
    authController.isAuthenticated,
    authController.isAuthorized,
    usersController.getUser
  )
  .put(
    authController.isAuthenticated,
    authController.isAuthorized,
    usersController.updateUser
  )
  .delete(
    authController.isAuthenticated,
    authController.isAuthorized,
    usersController.deleteUser
  );

//---------------------------------------------------------//

//*************************** EXPORTS ****************** */

module.exports = router;
