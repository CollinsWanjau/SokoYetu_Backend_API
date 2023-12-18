const Coupon = require('../models/couponModel')
const asyncHandler = require('express-async-handler')
const validateMongoId = require('../utils/validateMongoId')

const createCoupon = asyncHandler(async (req, res) => {
    try {
        const newCoupon = await Coupon.create(req.body)
        res.json(newCoupon)
    } catch {
        throw new Error(error)
    }
})

const getallCoupons = asyncHandler(async (req, res) => {
    try {
        const allCoupons = await Coupon.find(req.body)
        res.json(allCoupons)
    } catch {
        throw new Error(error)
    }
})

const updateCoupons = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoId(id)
    try {
        const updateCoupons = await Coupon.findByIdAndUpdate(id, req.body, { new: true })
        res.json(updateCoupons)
    } catch {
        throw new Error(error)
    }
})

const deleteCoupons = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoId(id)
    try {
        const updateCoupons = await Coupon.findByIdAndDelete(id)
        res.json(updateCoupons)
    } catch {
        throw new Error(error)
    }
})
module.exports = { createCoupon, getallCoupons, updateCoupons, deleteCoupons}