const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const jwt = require('jsonwebtoken')

const app = express()


const port = process.env.PORT
app.use(express.json())
app.use(userRouter)

module.exports = app