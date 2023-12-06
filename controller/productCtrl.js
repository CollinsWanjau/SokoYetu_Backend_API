const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify')
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
        // Extract query parameters from the request
        const queryObj = {...req.query}

        // Exclude certain fields from the query
        const excludeFields = ['page', 'sort', 'limit', 'fields']
        excludeFields.forEach((el) => delete queryObj[el])

        // Convert the query object to a string and replace specific keywords
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

        // Parse the modified query string and execute the query
        const query = Product.find(JSON.parse(queryStr))
        const product = await query

        // Send the resulting products as a JSON response
        res.json(product)
    } catch(error) {
        throw new Error(error)
    }
})


module.exports = { createProduct, getaProduct, getAllProduct, updateProduct, deleteProduct};
