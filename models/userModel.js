const { mongoose } = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt')
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

userSchema.methods.createPasswordResetToken = async function () {
    const resettoken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resettoken)
      .digest('hex')
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000 // 10 minutes
    return resettoken
}

//Export the model
module.exports = mongoose.model('User', userSchema);