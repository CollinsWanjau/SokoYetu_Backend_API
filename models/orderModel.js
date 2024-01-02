const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var orderSchema = new mongoose.Schema({
    // an array of objects, where each object represents a product in the order
    // Each product has an ObjectId reference to a Product model (ref: 'Product'), 
    // a count (which is presumably the quantity of the product in the order), and a color.
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            count: Number,
            color: String
        },
    ],

    // an object that will likely hold information about the payment intent for the order
    paymentIntent: {},

    // a string that represents the status of the order.
    // it can only be one of the values in the provided enum array.
    orderStatus: {
        type: String,
        default: 'Not processed',
        enum: [
            "Not processed",
            "Cash on delivery",
            "Processing",
            "Dispatched",
            "Cancelled",
            "Delivered"
        ],
    },
    orderby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
}, {
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Order', orderSchema);