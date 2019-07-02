const express = require('express')
const adminUser = require('../models/adminUser')
const jwt = require('jsonwebtoken')
const router = new express.Router()

router.post('/admin/login', async (req, res) => {
    try {
        if (!isAdmin(req.body.userName, req.body.password)) {
            throw new Error('Invalid username or password')
        }

        const token = jwt.sign({ _id: adminUser._id.toString() }, process.env.JWT_SECRETKEY)
        adminUser.token = token
        res.send({token})

    } catch (e) {
        res.status(401).send(e)
    }
})

const isAdmin = (userName, password) => {
    return (userName === adminUser.userName && password === adminUser.password)
}

module.exports = router