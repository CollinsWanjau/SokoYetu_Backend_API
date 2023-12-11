// Importing necessary modules and functions
const express = require('express')
const router = express.Router()

const { 
    createUser,     // Function to create a new user
    loginUserCtrl,  // Function to handle user login
    getallUsers,    // Function to get all users
    getaUser,       // Function to get a specific user by ID
    deleteaUser,    // Function to delete a user by ID
    updateaUser,     // Function to update a user by ID
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword
} = require('../controller/userCtrl')

const { authMiddleware, isAdmin} = require('../middlewares/authMiddleware')
/**
 * POST route to register a new user.
 * @route POST /register
 * @function
 * @name createUser
 */
router.post('/register', createUser)

router.put('/password', authMiddleware, updatePassword)
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
router.get("/refresh", handleRefreshToken)
router.get('/logout', logout)
/**
 * GET route to retrieve a specific user by ID.
 * @route GET /:id
 * @function
 * @name getaUser
 * @param {string} id - The ID of the user to retrieve.
 */
router.get('/:id', getaUser, isAdmin, authMiddleware)

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
router.put("/edit-user", authMiddleware, updateaUser)

/**
 * Handles the PUT request to block a user by ID.
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {void}
 */
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser)

/**
 * Handles the PUT request to unblock a user by ID.
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @returns {void}
 */
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser)



// Exporting the router for use in other parts of the application
module.exports = router
