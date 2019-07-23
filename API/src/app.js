const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const jwt = require('jsonwebtoken')
const adminRouter = require('./routers/admin')
const hrRouter = require('./routers/hr')
const holidayRouter = require ('./routers/holiday')
const leaveRouter = require('./routers/leave')
const managerRouter = require('./routers/manager')

const app = express()


const port = process.env.PORT
app.use(express.json())
app.use(userRouter)
app.use(adminRouter)
app.use(hrRouter)
app.use(holidayRouter)
app.use(leaveRouter)
app.use(managerRouter)

module.exports = app

//ToDo - All responses should be in standard format {error: error, data: data}