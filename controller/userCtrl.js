const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler')
const validateMongoId = require('../utils/validateMongoId')
const { generateRefreshToken } = require('../config/refreshToken')
const jwt = require('jsonwebtoken')
/**
 * createUser - Async function to create a new user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - JSON response containing the newly created user or an error message.
 * @throws {Error} - Throws an error if the user already exists.
 */
const createUser = asyncHandler(async (req, res) => {
  // Extract email from the request body
  const email = req.body.email;

  // Check if a user with the provided email already exists
  const findUser = await User.findOne({email: email});

  if (!findUser) {
    // If user doesn't exist, create a new User
    const newUser = new User(req.body);
    await newUser.save(); // Save the new user to the database
    res.json(newUser);  // Send the new user as a JSON response
  } else {
    throw new Error('User already exists')
  }
});


/**
 * Controller function for user login.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - A Promise that resolves when the function is complete.
 */
const loginUserCtrl = asyncHandler(async (req, res) => {

  // Extract email and password from the request body
  const {email, password} = req.body

  // check if user exists
  const findUser = await User.findOne({ email })

  // Validate the user's password
  if(findUser && (await findUser.isPasswordMatched(password))) {

    // This function creates a unique token that can be used to obtain new 
    // access tokens when the old ones expire. The function returns the 
    // refresh token as a promise
    const refreshToken = await generateRefreshToken(findUser?._id)

    // a way to update a document in a MongoDB database.
    // It passes the user’s ID, the new refresh token, and an option to return the updated document as arguments
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // means it cannot be accessed by client-side JavaScript
      maxAge:72 * 60 * 60 * 1000
    })
    // If the password is correct, send a JSON response with user information and a token
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id)
    })
  } else {
     // If the password is incorrect or the user doesn't exist, throw an error
    throw new Error('Invalid credentials')
  }
})

// Handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  // Extract refresh token from cookies
  const cookie = req.cookies
  console.log(cookie)

  // Check if refresh token exists in cookies
  if (!cookie?.refreshToken) {
    throw new Error('No refresh token in cookies')
  }

  const refreshToken = cookie?.refreshToken
  console.log(refreshToken)

  // Find user based on refresh token
  const user = await User.findOne({ refreshToken })

  if(!user) throw new Error(' No Refresh token present in db or not matched')
  
  // Verify the refresh token
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error('There is something wrong with the refresh token')
    }

    // Generate a new access token
    const accessToken = generateToken(user?._id)
    res.json({ accessToken })
  })
})

// Logout functionality
// Clears the refresh token for the authenticated user
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies

  // Check if refresh token exists in cookies
  if (!cookie?.refreshToken) throw new Error('No refresh token in Cookies')

  const refreshToken = cookie.refreshToken

  // Find user by refresh token
  const user = await User.findOne({refreshToken})
  if (!user) {
    // Clear the refresh token cookie and respond with forbidden status
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true
    })
    return res.sendStatus(204)  // forbidden
  }

  // Update user's refresh token to an empty string
  await User.findOneAndUpdate({refreshToken: refreshToken}, {
    refreshToken: ''
  })

  // Clear the refresh token cookie and respond with forbidden status
  res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true
    })
    res.sendStatus(204)  // forbidden
})

// Update a user
const updateaUser = asyncHandler(async (req, res) => {
  console.log(req.user)
  // const {id} = req.user
  const { _id } = req.params
  validateMongoId(_id)
  try {
    const updateUser = await User.findByIdAndUpdate(id, {
      firstname: req?.body?.firstname,
      lastname: req?.body?.lastname,
      email: req?.body?.email,
      mobile: req?.body?.mobile,
      
    }, {new: true,} )
    res.json(updateUser)
  } catch (error) {
    throw new Error(error)
  }
})

/**
 * getallUsers - Route handler function to retrieve all users.
 *
 * This function is designed to handle a GET request to the '/all-users' endpoint.
 * It is expected to retrieve and return a list of all users in the system.
 *
 * @function
 * @name getallUsers
 * @param {Object} req - The Express.js request object.
 * @param {Object} res - The Express.js response object.
 * @returns {void} The function is responsible for sending the response with the list of users.
 */
const getallUsers = asyncHandler(async (req, res) => {
  try {
    // Implement the logic to retrieve all users from the system
    // This might involve querying a database or fetching data
    const getUsers = await User.find()

    // Send the retrieved users as the response
    res.json(getUsers)
  } catch (err) {
    throw new Error(error)
  }
})

// Get a single user
const getaUser = asyncHandler(async (req, res) => {
  // console.log(req.params)
  const { id } = req.params
  console.log('Received ObjectId:', id);
  validateMongoId(id)
  try {
    const getaUser = await User.findById(id)
    res.json({getaUser})
  } catch (err) {
    throw new Error(err)
  }
  
})

// Delete a user
const deleteaUser = asyncHandler(async (req, res) => {
  console.log(req.params)
  const { id } = req.params
  validateMongoId(id)
  try {
    const getaUser = await User.findByIdAndDelete(id)
    res.json({deleteaUser})
  } catch (err) {
    throw new Error(error)
  }
})

// Block user
const blockUser = asyncHandler(async (req, res) => {
  const {id} = req.params
  validateMongoId(id)
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true
      },
      {
        new: true
      }
    )
    res.json({
      message:'User blocked'
    })
  } catch (error) {
    throw new Error(error)
  }
})

// Unblock user
const unblockUser = asyncHandler(async (req, res) => {
  const {id} = req.params
  validateMongoId(id)
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false
      },
      {
        new: true
      }
    )
    res.json({
      message:'User unblocked'
    })
  } catch (error) {
    throw new Error(error)
  }

})

module.exports = { 
  createUser,
  loginUserCtrl,
  getallUsers,
  getaUser,
  deleteaUser,
  updateaUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout
};
