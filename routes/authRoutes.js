// Importing necessary modules and functions
const express = require('express')
const router = express.Router()

const { 
    createUser,     // Function to create a new user
    loginUserCtrl,  // Function to handle user login
    getallUsers,    // Function to get all users
    getaUser,       // Function to get a specific user by ID
    deleteaUser,    // Function to delete a user by ID
    updateaUser     // Function to update a user by ID
} = require('../controller/userCtrl')

/**
 * POST route to register a new user.
 * @route POST /register
 * @function
 * @name createUser
 */
router.post('/register', createUser)

/**
 * POST route to handle user login.
 * @route POST /login
 * @function
 * @name loginUserCtrl
 */
router.post('/login', loginUserCtrl)

/**
 * GET route to retrieve all users.
 * @route GET /all-users
 * @function
 * @name getallUsers
 */
router.get('/all-users', getallUsers)

/**
 * GET route to retrieve a specific user by ID.
 * @route GET /:id
 * @function
 * @name getaUser
 * @param {string} id - The ID of the user to retrieve.
 */
router.get('/:id', getaUser)

/**
 * DELETE route to delete a user by ID.
 * @route DELETE /:id
 * @function
 * @name deleteaUser
 * @param {string} id - The ID of the user to delete.
 */
router.delete('/:id', deleteaUser)

/**
 * PUT route to update a user by ID.
 * @route PUT /:id
 * @function
 * @name updateaUser
 * @param {string} id - The ID of the user to update.
 */
router.put("/:id", updateaUser)

// Exporting the router for use in other parts of the application
module.exports = router
