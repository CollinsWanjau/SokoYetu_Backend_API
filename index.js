const express = require('express')
const connectDB = require('./config/dbConnect')
const app = express()
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 4000
const authRoute = require('./routes/authRoutes')
const { notFound, errorHandler } = require('./middlewares/errorHandler')
// const bodyParser = require('body-parser')
connectDB()

// app.get('/', (req, res) => {
//     res.send('Hello from the server side\n')
// })
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false}))
app.use(express.json())
app.use(express.urlencoded({ extended: false}))
app.use('/api/user', authRoute)

// after authroute we pass in the middleware
app.use(notFound)
app.use(errorHandler)
app.listen(PORT, () => {
    console.log(`Server is running as PORT ${PORT}`)
})