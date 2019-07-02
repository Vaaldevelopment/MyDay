const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const jwt = require('jsonwebtoken')
const adminUserRouter = require('./routers/adminUser')

const app = express()


const port = process.env.PORT
app.use(express.json())
app.use(userRouter)
app.use(adminUserRouter)

module.exports = app