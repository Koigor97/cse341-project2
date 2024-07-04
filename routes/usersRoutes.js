//* using express router to create modular, mountable route handlers
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');

//*************************** ROUTES ****************** */

/**
 * * using the route method from express.Router()
 * * function to define and chain route handlers
 */

//* authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router
  .route('/')
  .get(usersController.getUsers)
  .post(usersController.createUser);

router
  .route('/:id')
  .get(usersController.getUser)
  .put(usersController.updateUser)
  .delete(usersController.deleteUser);

//*************************** EXPORTS ****************** */

module.exports = router;
