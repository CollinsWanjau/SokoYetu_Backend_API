const express = require('express')
const connectDB = require('./config/dbConnect')
const app = express()
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 4000
const authRoute = require('./routes/authRoutes')
const { notFound, errorHandler } = require('./middlewares/errorHandler')
const cookieParser = require('cookie-parser')
const productRoute = require('./routes/productRoute')
const morgan = require('morgan')
// const bodyParser = require('body-parser')
connectDB()

app.use(morgan('dev'))
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false}))
app.use(express.json())
app.use(express.urlencoded({ extended: false}))

// cookie-parser is a middleware function that parses the Cookie header and populates the req.cookies and req.signedCookies properties with an object keyed by the cookie names
app.use(cookieParser())

app.use('/api/user', authRoute)
app.use('/api/product', productRoute)


// after authroute we pass in the middleware
app.use(notFound)
app.use(errorHandler)
app.listen(PORT, () => {
    console.log(`Server is running as PORT ${PORT}`)
})