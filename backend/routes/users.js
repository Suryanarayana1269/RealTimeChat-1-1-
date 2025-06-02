const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const authenticate = require('../middleware/auth');

// @route   GET /api/users
router.get('/', authenticate, getUsers);

module.exports = router;
