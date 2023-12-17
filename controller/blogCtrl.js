const Blog = require('../models/blogModels')
const mongoose = require('mongoose');
const User = mongoose.model('User');
const asyncHandler = require('express-async-handler')
const validateMongoDbId = require('../utils/validateMongoId')

/**
 * Create a new blog post.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const createBlog = asyncHandler(async (req, res) => {
    try{
        const newBlog = await Blog.create(req.body)
        res.json(newBlog)
    } catch(error) {
        throw new Error(error)
    }
})


const updateBlog = asyncHandler(async (req, res) => {
    const {id} = req.params
    validateMongoDbId(id)
    try{
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true
        })
        res.json(updateBlog)
    } catch(error) {
        throw new Error(error)
    }
})

const getBlog = asyncHandler(async (req, res) => {
    const {id} = req.params
    validateMongoDbId(id)
    try{
        const getBlog = await Blog.findById(id)
        const updatedBlog = await Blog.findByIdAndUpdate(
            id, {
                $inc: { numViews: 1 }
            },
            {new: true}
        )
        res.json(updatedBlog)
    } catch(error) {
        throw new Error(error)
    }
})

const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const getAllBlogs = await Blog.find()
        res.json(getAllBlogs)
    } catch(error) {
        throw new Error(error)
    }
})

const deleteBlog = asyncHandler(async (req, res) => {
    const {id} = req.params
    validateMongoDbId(id)
    try{
        const deletedBlog = await Blog.findByIdAndDelete(id)
        res.json(deletedBlog)
    } catch(error) {
        throw new Error(error)
    }
})

const likeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body
    validateMongoDbId(blogId)

    // fetches the blog post with the given blogId from the database.
    const blog = await Blog.findById(blogId)
    // gets the ID of the logged-in user from the request object.
    const loginUserId = req?.user?._id
    // indicates whether the logged-in user has already liked the post.
    const isLiked = blog?.isLiked
    // checks if the logged-in user has already disliked the post.
    // It does this by looking for the user's ID in the dislikes array
    // of the blog post.
    const alreadyDisliked = blog?.dislikes.find(
        (userId) => userId?.toString() === loginUserId?.toString())
    //  this block of code removes the user's dislike.
    if (alreadyDisliked) {
        // It does this by calling Blog.findByIdAndUpdate with the
        // $pull operator to remove the user's ID from the dislikes array,
        // and it sets isDisliked to false
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId },
                isDisliked: false
            },
            { new: true}
        )
        res.json(blog)
    }
    if (isLiked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId },
                isLiked: false
            },
            { new: true}
        )
        res.json(blog)
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { likes: loginUserId },
                isLiked: true
            },
            { new: true}
        )
        res.json(blog)
    }
})

const disLikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body
    validateMongoDbId(blogId)

    // fetches the blog post with the given blogId from the database.
    const blog = await Blog.findById(blogId)
    // gets the ID of the logged-in user from the request object.
    const loginUserId = req?.user?._id
    // indicates whether the logged-in user has already liked the post.
    const isDisliked = blog?.isDisliked
    // checks if the logged-in user has already disliked the post.
    // It does this by looking for the user's ID in the dislikes array
    // of the blog post.
    const alreadyDisliked = blog?.likes.find(
        (userId) => userId?.toString() === loginUserId?.toString())
    //  this block of code removes the user's dislike.
    if (alreadyDisliked) {
        // It does this by calling Blog.findByIdAndUpdate with the
        // $pull operator to remove the user's ID from the dislikes array,
        // and it sets isDisliked to false
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId },
                isLiked: false
            },
            { new: true}
        )
        res.json(blog)
    }
    if (isDisliked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId },
                isDisliked: false
            },
            { new: true}
        )
        res.json(blog)
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { dislikes: loginUserId },
                isDisliked: true
            },
            { new: true}
        )
        res.json(blog)
    }
})
module.exports = { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, disLikeBlog}