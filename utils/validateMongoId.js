/**
 * Validates a MongoDB ObjectId.
 * 
 * @throws {Error} Throws an error if the id is not a valid ObjectId.
 */
const mongoose = require('mongoose')
const validateMongoId = (id) => {
    //  check whether the provided id is a valid ObjectId.
    const isValid = mongoose.Types.ObjectId.isValid(id)
    if (!isValid) throw new Error('This id is not valid or not Found')
}

module.exports = validateMongoId
