// Verifying jwt token
// Check if the user is admin or not
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

/**
 * Middleware to handle user authentication using JWT.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 * @throws {Error} Throws an error if authentication fails.
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the authorization header starts with "Bearer"
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    // Split the token from the "Bearer" prefix
    token = req.headers.authorization.split(' ')[1];

    try {
      // Verify the token using the secret key
      if (token) {
        /**
                * Synchronously verify given token using a secret or a public key to get a decoded token
                * token - JWT string to verify
                * secretOrPublicKey - Either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA.
                * [options] - Options for the verification
                * returns - The decoded token.
                */
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user associated with the decoded ID
        const user = await User.findById(decoded?.id);

        // Attach the user object to the request
        req.user = user;
        next();
      }
    } catch (error) {
      // Throw an error if the token verification fails
      throw new Error('Not authorized token expired, Please login again');
    }
  } else {
    // Throw an error if there is no token attached to the header
    throw new Error(' There is no token attached to header');
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    // Extract the user's email from the request object
    const { email } = req.user

    // Check if the user with the provided email exists in the database
    const adminUser = await User.findOne(email)

    // Verify if the user is an admin
    if (adminUser.role !== 'admin') {
        // Throw an error if the user is not an admin
        throw new Error('You are not an admin')
    } else {
        // Proceed to the next middleware or route handler
        next()
    }
})
module.exports = { authMiddleware, isAdmin};
