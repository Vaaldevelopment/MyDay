const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const jwt = require('jsonwebtoken')
const adminRouter = require('./routers/admin')
const hrRouter = require('./routers/hr')

const app = express()


const port = process.env.PORT
app.use(express.json())
app.use(userRouter)
app.use(adminRouter)
app.use(hrRouter)

module.exports = app