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
}, {
    timestamps: true
});


userSchema.pre("save", async function (next) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt);
})

// a property of the userschema object that allows you to define instance methods for your
// user documents
userSchema.methods.isPasswordMatched = async function(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password)
}
//Export the model
module.exports = mongoose.model('User', userSchema);