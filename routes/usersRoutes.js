//* using express router to create modular, mountable route handlers
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');

//*************************** ROUTES ****************** */

//---------------------------------------------------------//

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
