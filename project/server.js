const express = require("express")
const dotenv = require("dotenv")
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const {xss} = require('express-xss-sanitizer')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')

dotenv.config({ path: "./config/config.env" })

connectDB()

const dentists = require('./routes/dentist')
const auth = require('./routes/auth')
const appointments = require('./routes/appointments')
const report = require('./routes/reports')
const { version } = require("mongoose")

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(mongoSanitize())
app.use(helmet())
app.use(xss())
app.use(hpp())
app.use(cors())

const limiter = rateLimit({
    windowMs: 10*60*1000,
    max: 100
})
app.use(limiter)

const swaggerOption = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express VacQ API'
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1'
            }
        ]
    },
    apis: ['./routes/*.js']
}
const swaggerDocs = swaggerJsDoc(swaggerOption)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))

app.use('/api/v1/dentists', dentists)
app.use('/api/v1/auth', auth)
app.use('/api/v1/appointments', appointments)
app.use('/api/v1/reports', report)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, console.log('Server running in', process.env.NODE_ENV, 'mode on port', PORT))

process.on('unhandleRejection', (err, promise) => {
    console.log(`Error: ${err.message}`)
    server.close(() => process.exit(1))
})