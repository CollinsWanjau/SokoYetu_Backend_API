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
    updatePassword,
    forgotPassowrdToken,
    resetPassword,
    loginAdminCtrl,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    updateOrderStatus
} = require('../controller/userCtrl')

const { authMiddleware, isAdmin} = require('../middlewares/authMiddleware')
const { reset } = require('nodemon')
/**
 * POST route to register a new user.
 * @route POST /register
 * @function
 * @name createUser
 */
router.post('/register', createUser)
router.post('/forgot-password-token', forgotPassowrdToken)
router.put('/password', authMiddleware, updatePassword)
router.put('/reset-password/:token', resetPassword)
/**
 * POST route to handle user login.
 * @route POST /login
 * @function
 * @name loginUserCtrl
 */
router.post('/login', loginUserCtrl)
router.post('/admin-login', loginAdminCtrl)
router.post('/cart', authMiddleware, userCart)
router.post('/cart/applycoupon', authMiddleware, applyCoupon)
router.post('/cart/cash-order', authMiddleware, createOrder)
/**
 * GET route to retrieve all users.
 * @route GET /all-users
 * @function
 * @name getallUsers
 */
router.get('/all-users', getallUsers)
router.get('/get-orders', authMiddleware,getOrders)
router.get("/refresh", handleRefreshToken)
router.get('/logout', logout)
router.get('/wishlist', authMiddleware, getWishlist)
router.get('/cart', authMiddleware, getUserCart)
// router.get('/:id/wishlist', authMiddleware, getWishlist)
/**
 * GET route to retrieve a specific user by ID.
 * @route GET /:id
 * @function
 * @name getaUser
 * @param {string} id - The ID of the user to retrieve.
 */
router.get('/:id', getaUser, isAdmin, authMiddleware)
router.delete('/empty-cart', authMiddleware, emptyCart)
/**
 * DELETE route to delete a user by ID.
 * @route DELETE /:id
 * @function
 * @name deleteaUser
 * @param {string} id - The ID of the user to delete.
 */
router.delete('/:id', deleteaUser)
router.put(
    '/order/update-order/:id',
    authMiddleware,
    isAdmin,
    updateOrderStatus
)
router.put("/save-address", authMiddleware, saveAddress)
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
