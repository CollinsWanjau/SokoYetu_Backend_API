const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler')
const validateMongoDbId = require('../utils/validateMongoDbId')

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

// Update a user

const updateaUser = asyncHandler(async (req, res) => {
  console.log(req.user)
  // const {id} = req.user
  const { _id } = req.params
  validateMongoDbId(_id)
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
  console.log(req.params)
  const { id } = req.params
  validateMongoDbId(id)
  try {
    const getaUser = await User.findById(id)
    res.json({getaUser})
  } catch (err) {
    throw new Error(error)
  }
})

// Delete a user
const deleteaUser = asyncHandler(async (req, res) => {
  console.log(req.params)
  const { id } = req.params
  validateMongoDbId(id)
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
  validateMongoDbId(id)
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
  validateMongoDbId(id)
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
  unblockUser
};
