const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify')
const User = require('../models/userModel')
const validateMongoId = require('../utils/validateMongoId');
const cloudinaryUploadImg = require('../utils/cloudinary');
const fs = require('fs')
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
        req.body.slug = slugify(req.body.title)
    }
    if (!req.body.slug) {
      throw new Error('Failed to generate a valid slug from the provided title.');
    }
    const newProduct = await Product.create(req.body)
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
    // const id = req.params
    const productId = req.params.id;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const updateProduct = await Product.findOneAndUpdate({_id: productId}, req.body, {
            new: true
        })
        res.json(updateProduct)
    } catch(error) {
        throw new Error(error)
    }  
})

const deleteProduct = asyncHandler(async (req, res) => {
    // const id = req.params
    const productId = req.params.id;
    try {
        
        const deleteProduct = await Product.findOneAndDelete({_id: productId})
        res.json(deleteProduct)
    } catch(error) {
        throw new Error(error)
    }  
})
const getaProduct = asyncHandler(async (req, res) => {
    const {id} = req.params
    try {
        const findProduct = await Product.findById(id)
        res.json(findProduct)
    } catch(error) {
        throw new Error(error)
    }
})

/**
 * Handler function to get all products based on query parameters.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @returns {Promise<void>} - Asynchronous function without a direct return.
 */
const getAllProduct = asyncHandler(async (req, res) => {
    // console.log(req.query)
    try {
        // Filtering
        // Extract query parameters from the request
        const queryObj = {...req.query}

        // Exclude certain fields from the query
        const excludeFields = ['page', 'sort', 'limit', 'fields']
        excludeFields.forEach((el) => delete queryObj[el])

        // Convert the query object to a string and replace specific keywords
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

        // Parse the modified query string and execute the query
        let query = Product.find(JSON.parse(queryStr))

        // Sorting

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
        } else {
            query = query.sort('-createdAt')
        }

        // limiting fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ')
            query = query.select(fields)
        } else {
            query.select('-__v')
        }

        // Pagination

        const page = req.query.page
        const limit = req.query.limit
        const skip = (page - 1) * limit
        query = query.skip(skip).limit(limit)
        if(req.query.page) {
            const productCount = await Product.countDocuments()
            if(skip >= productCount) throw new Error('This page does not exist')
        }
        console.log(page, limit, skip)


        const product = await query

        // Send the resulting products as a JSON response
        res.json(product)
    } catch(error) {
        throw new Error(error)
    }
})

/**
 * Adds or removes a product from the user's wishlist.
 * @param {Object} req - Express request object containing user information and product ID.
 * @param {Object} res - Express response object.
 * @returns {Object} - Updated user object with the modified wishlist.
 */
const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { prodId } = req.body
    try {
        const user = await User.findById(_id)

        // Check if the product is already in the wishlist
        const alreadyadded = user.wishlist.find((id) => id.toString() === prodId)
        if (alreadyadded) {
            // If already added, remove the product from the wishlist
            let user = await User.findOneAndUpdate(
                _id,
                {
                    $pull: { wishlist: prodId}
                },
                { new: true }
            )
            res.json(user)
        } else {
            // If not added, add the product to the wishlist
            let user = await User.findOneAndUpdate(
                _id,
                {
                    $push: { wishlist: prodId}
                },
                { new: true }
            )
            res.json(user)
        }
    } catch(error) { 
        throw new Error
    }
})

const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user
    const { star, prodId, comment} = req.body
    try {
        const product = await Product.findById(prodId)
        let alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === _id.toString())
        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated}
                },
                {
                    $set: { "ratings.$.star": star, "ratings.$.comment": comment}
                },
                {
                    new: true
                }
            )
            // res.json(updateRating)
        } else {
            const rateProduct = await Product.findByIdAndUpdate(
                prodId,
                {
                    $push: {
                        ratings: {
                            star: star,
                            comment: comment,
                            postedby: _id
                        },
                    },
                    
                },
                {
                    new: true
                },
                )
                // res.json(rateProduct)
        }
        const getallratings = await Product.findById(prodId)
        let totalrating = getallratings.ratings.length
        let ratingsum = getallratings.ratings
            .map((item) => item.star)
            .reduce((prev, curr) => prev + curr, 0)
        let actualRating = Math.round(ratingsum / totalrating)
        let finalProduct = await Product.findByIdAndUpdate(prodId, {
            totalRatings: totalrating,
            averageRating: actualRating
        }, { new: true })
        res.json(finalProduct)
    } catch(error) {
        throw new Error
    }
    

})

/**
 * @async
 * @function uploadImages
 * @description This function uploads multiple images to Cloudinary and updates a product with the URLs of the uploaded images.
 * @param {Object} req - Express request object. The request should contain the product id in the params and the files to be uploaded in the files property.
 * @param {Object} res - Express response object.
 * @throws Will throw an error if the upload or the database update fails.
 * @returns {Object} The updated product.
 * 
 * @example
 * 
 * // POST /uploadImages/:id
 * // Request body contains the files to be uploaded
 * // Response: the updated product
 */
const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoId(id)
    // logs the files property of the request object.When using middleware like
    // Multer for handling file uploads, the uploaded files are available in req.files
    console.log(req.files)
    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'images')
        const url = []
        const files = req.files
        for (const file of files) {
            const { path } = file
            const newpath = await uploader(path)
            console.log(newpath)
            url.push(newpath)
            // synchronously deletes a file from the file system.
            fs.unlinkSync(path)
        }
        const findProduct = await Product.findByIdAndUpdate(
            id,
            {
                images: url.map((file) => {
                    return file
                })
            },
            { new: true },
        )
        res.json(findProduct)
    } catch(error) {
        throw new Error(error.message)
    }
})

module.exports = { createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct, addToWishlist, rating, uploadImages};
