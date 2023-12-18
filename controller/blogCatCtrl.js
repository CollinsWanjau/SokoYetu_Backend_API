const Category = require('../models/blogCatModel')
const asyncHandler = require('express-async-handler')
const validateMongoId = require('../utils/validateMongoId')

const createCategory = asyncHandler(async (req, res) => {
    try {
        const newCategory = await Category.create(req.body)
        res.json(newCategory)
    } catch(error) {
        throw new Error
    }
})

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoId(id)
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
            new: true
        })
        res.json(updatedCategory)
    } catch(error) {
        throw new Error
    }
})

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoId(id)
    try {
        const deletedCategory = await Category.findByIdAndDelete(id)
        res.json(deletedCategory)
    } catch(error) {
        throw new Error
    }
})

const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoId(id)
    try {
        const getaCategory = await Category.findById(id)
        res.json(getaCategory)
    } catch(error) {
        throw new Error
    }
})

const getAllCategory = asyncHandler(async (req, res) => {
    try {
        const getallCategory = await Category.find()
        res.json(getallCategory)
    } catch(error) {
        throw new Error
    }
})
module.exports = { createCategory, updateCategory, deleteCategory, getCategory, getAllCategory}