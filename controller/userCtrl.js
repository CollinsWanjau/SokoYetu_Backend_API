const Product = require('../models/productModel')
const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')
const Order = require('../models/orderModel')
const { generateToken } = require('../config/jwtToken');
const uniqid = require('uniqid');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const validateMongoId = require('../utils/validateMongoId');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('./emailCtrl');
const crypto = require('crypto');
const { hash } = require('bcrypt');

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
  const findUser = await User.findOne({ email });

  if (!findUser) {
    // If user doesn't exist, create a new User
    const newUser = new User(req.body);
    await newUser.save(); // Save the new user to the database
    res.json(newUser); // Send the new user as a JSON response
  } else {
    throw new Error('User already exists');
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
  const { email, password } = req.body;

  // check if user exists
  const findUser = await User.findOne({ email });
  // Validate the user's password
  if (findUser && (await findUser.isPasswordMatched(password))) {
    // This function creates a unique token that can be used to obtain new
    const refreshToken = await generateRefreshToken(findUser?._id);

    // a way to update a document in a MongoDB database.
    // It passes the user’s ID, the new refresh token, and an option to return the updated document as arguments
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken
      },
      { new: true }
    )
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // means it cannot be accessed by client-side JavaScript
      maxAge: 72 * 60 * 60 * 1000
    });
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
    throw new Error('Invalid credentials');
  }
});

const loginAdminCtrl = asyncHandler(async (req, res) => {
  // Extract email and password from the request body
  const { email, password } = req.body;

  // check if user exists
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== 'admin') throw new Error('Not authorised')
  // Validate the user's password
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    // This function creates a unique token that can be used to obtain new
    const refreshToken = await generateRefreshToken(findAdmin?._id);

    // a way to update a document in a MongoDB database.
    // It passes the user’s ID, the new refresh token, and an option to return the updated document as arguments
    const updateUser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken
      },
      { new: true }
    )
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // means it cannot be accessed by client-side JavaScript
      maxAge: 72 * 60 * 60 * 1000
    });
    // If the password is correct, send a JSON response with user information and a token
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id)
    })
  } else {
    throw new Error('Invalid credentials');
  }
});

// Handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  // Extract refresh token from cookies
  const cookie = req.cookies;
  console.log(cookie);

  // Check if refresh token exists in cookies
  if (!cookie?.refreshToken) {
    throw new Error('No refresh token in cookies');
  }

  const refreshToken = cookie?.refreshToken;
  console.log(refreshToken);

  // Find user based on refresh token
  const user = await User.findOne({ refreshToken });

  if (!user) throw new Error(' No Refresh token present in db or not matched');

  // Verify the refresh token
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error('There is something wrong with the refresh token');
    }

    // Generate a new access token
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// Logout functionality
// Clears the refresh token for the authenticated user
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;

  // Check if refresh token exists in cookies
  if (!cookie?.refreshToken) throw new Error('No refresh token in Cookies');

  const refreshToken = cookie.refreshToken;

  // Find user by refresh token
  const user = await User.findOne({ refreshToken });
  if (!user) {
    // Clear the refresh token cookie and respond with forbidden status
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true
    });
    return res.sendStatus(204); // forbidden
  }

  // Update user's refresh token to an empty string
  await User.findOneAndUpdate({ refreshToken }, {
    refreshToken: ''
  });

  // Clear the refresh token cookie and respond with forbidden status
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true
  });
  res.sendStatus(204); // forbidden
});

// Update a user
const updateaUser = asyncHandler(async (req, res) => {
  console.log(req.user);
  // const {id} = req.user
  const { _id } = req.params;
  validateMongoId(_id);
  try {
    const updateUser = await User.findByIdAndUpdate(id, {
      firstname: req?.body?.firstname,
      lastname: req?.body?.lastname,
      email: req?.body?.email,
      mobile: req?.body?.mobile

    }, { new: true });
    res.json(updateUser);
  } catch (error) {
    throw new Error(error);
  }
});

// save user address

const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  try {
    const updateUser = await User.findByIdAndUpdate(_id, {
      address: req?.body?.address

    }, { new: true });
    res.json(updateUser);
  } catch (error) {
    throw new Error(error);
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
    const getUsers = await User.find();

    // Send the retrieved users as the response
    res.json(getUsers);
  } catch (err) {
    throw new Error(error);
  }
});

// Get a single user
const getaUser = asyncHandler(async (req, res) => {
  // console.log(req.params)
  const { id } = req.params;
  console.log('Received ObjectId:', id);
  validateMongoId(id);
  try {
    const getaUser = await User.findById(id);
    res.json({ getaUser });
  } catch (err) {
    throw new Error(err);
  }
});

// Delete a user
const deleteaUser = asyncHandler(async (req, res) => {
  console.log(req.params);
  const { id } = req.params;
  validateMongoId(id);
  try {
    const getaUser = await User.findByIdAndDelete(id);
    res.json({ deleteaUser });
  } catch (err) {
    throw new Error(error);
  }
});

// Block user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true
      },
      {
        new: true
      }
    );
    res.json({
      message: 'User blocked'
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Unblock user
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false
      },
      {
        new: true
      }
    );
    res.json({
      message: 'User unblocked'
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const {password} = req.body;
  validateMongoId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPassowrdToken = asyncHandler(async (req, res ) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) throw new Error("User not found with this email")
  try {
    const token = await user.createPasswordResetToken()
    await user.save()
    const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</a>`;
    const data = {
      to: email,
      text: 'Hey User',
      subject: 'Forgot Passowrd Link',
      html: resetURL
    }
    sendEmail(data)
    res.json(token)
  } catch (error) {
  throw new Error(error)
}
})

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body
  const { token } = req.params
  const hashedToken = crypto.createHash('sha256')
    .update(token)
    .digest('hex')
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  })
  if (!user) throw new Error('Token expired, Please try again later')
  user.password = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()
  res.json(user)
})

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user
  validateMongoId(_id)
  try {
    const findUser = await User.findById(_id).populate('wishlist')
    if (!findUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(findUser)
  } catch(error) {
    throw new Error(error)
  }
})

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body
  const { _id } = req.user
  validateMongoId(_id)
  try {
    let products = []
    const user = await User.findById(_id)
    // check if user already have product in cart
    const alreadyExistCart = await Cart.findOne({ orderby: user._id })
    if (alreadyExistCart) {
      alreadyExistCart.remove()
    }

    // For each element in the cart array, we create a new object with
    // properties product, count, and color
    for (let i = 0; i < cart.length; i++) {
      let object = {}
      object.product = cart[i]._id
      object.count = cart[i].count
      object.color = cart[i].color

      // select method to specify that we only want to retrieve the price property
      // of the product.
      // exec method to execute the query and retrieve the price of the product.
      let getPrice = await Product.findById(cart[i]._id).select('price').exec()
      object.price = getPrice.price
      products.push(object)
    }
    let cartTotal = 0
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count
    }
    // console.log(products, cartTotal)
    let newCart = await new Cart({
      products,
      cartTotal,
      orderby: user?._id
    }).save()
    res.json(newCart)
  } catch(error) {
    throw new Error(error)
  }
})

const getUserCart = asyncHandler(async (req, res) => {
  const {_id} = req.user
  validateMongoId(_id)
  try {
    const cart = await Cart.findOne({ orderby: _id}).populate('products.product')
    res.json(cart)
  } catch(error) {
    throw new Error(error)
  }
})


const emptyCart = asyncHandler(async (req, res) => {
  const {_id} = req.user
  validateMongoId(_id)
  try {
    const user = await User.findOne({ _id })
    const cart = await Cart.findOneAndDelete({ orderby: user._id})
    res.json(cart)
  } catch(error) {
    throw new Error(error)
  }
})

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body
  const { _id } = req.user
  const validCoupon = await Coupon.findOne({ name: coupon })
  // console.log(validCoupon)
  if (validCoupon === null) {
    throw new Error('Invalid Coupon')
  }
  const user = await User.findOne({ _id })
  let { cartTotal } = await Cart.findOne({
    orderby: user._id,
  }).populate('products.product')
  let totalAfterDiscount = (
    cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2)
    await Cart.findOneAndUpdate(
      { orderby: user._id },
      { totalAfterDiscount },
      { new: true }
    )
    res.json(totalAfterDiscount)
})

const createOrder = asyncHandler(async (req, res) => {
  const { COD, couponApplied } = req.body
  const { _id } = req.user
  validateMongoId(_id)
  try {
    if (!COD) throw new Error('Create cash order failed')
    const user = await User.findById(_id)
    let userCart = await Cart.findOne({ orderby: user._id })
    let finalAmount = 0

    // checks if a coupon has been applied and if totalAfterDiscount is available in the user's cart.
    // If both conditions are true, it sets finalAmount to totalAfterDiscount
    if(couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount
    } else {
      finalAmount = userCart.cartTotal
    }

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmount,
        status: "Cash on delivery",
        created: Date.now(),
        currency: "usd"
      },
      orderby: user._id,
      orderStatus: "Cash on delivery"
    }).save()

    // For each item in userCart.products, it creates an updateOne operation
    // The filter property specifies the condition for choosing the document to update. It selects the document where _id equals item.product._id.
    // The update property specifies the modifications to be made. It uses the $inc operator to decrement the quantity field by item.count and increment the sold field by item.count
    let update = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id},
          update: { $inc: { quantity: -item.count, sold: +item.count }}
        }
      }
    })

    // The resulting update array can be used with MongoDB's bulkWrite method to perform all the updates in a single operation.
    const updated = await Product.bulkWrite(update, {})
    res.json({ message: 'success' })
  } catch(error) {
    throw new Error(error)
  }
})

const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user
  validateMongoId(_id)
  try {
    const userorders = await Order.find({ orderby: _id })
      .populate('products.product')
      // .populate('orderby')
      .exec()
    res.json(userorders)
  } catch(error) {
    throw new Error(error)
  }
})

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const { id } = req.params
  validateMongoId(id)
  try {
    const updateorderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    )
    res.json(updateorderStatus)
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
};
