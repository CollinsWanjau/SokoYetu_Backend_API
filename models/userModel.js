const { mongoose } = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt')
const crypto = require('crypto')
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
    },
    lastname:{
        type:String,
        required:true, 
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    // create user role
    role: {
        type: String,
        default: 'user'
    },
    // Cart
    cart: { type: Array,default: []},
    // Blocked accounts model
    isBlocked: {
        type: Boolean,
        default: false
    },
    // Address
    address: [{ type: mongoose.Schema.ObjectId, ref: "Address"}],
    // Wishlist
    wishlist: [{ type: mongoose.Schema.ObjectId, ref: "Product"}],
    // Refresh token
    refreshToken: {
        type: String,
    },

    // Passowrd reset token
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    timestamps: true
});


userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt);
    next()
})

// a property of the userschema object that allows you to define instance methods for your
// user documents
userSchema.methods.isPasswordMatched = async function(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password)
}

/**
 * Creates a password reset token and updates the user instance with token and expiration.
 * @returns {string} The generated password reset token.
 * @throws {Error} If there is an issue generating the token or updating the user instance.
 */
userSchema.methods.createPasswordResetToken = async function () {
    // Generate a random 32-byte token using crypto
    const resettoken = crypto.randomBytes(32).toString('hex')

    // Hash the reset token using SHA-256 algorithm
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resettoken)
      .digest('hex')
    
    // Set the password reset expiration time to 30 minutes from the current time
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000
    return resettoken
}

//Export the model
module.exports = mongoose.model('User', userSchema);