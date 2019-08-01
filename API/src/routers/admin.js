const express = require('express')
const admin = require('../models/admin')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const router = new express.Router()

const authorizeAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        if (token !== admin.token) {
            throw new Error()
        }
        req.token = token
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

router.post('/admin/login', async (req, res) => {
    try {
        if (!isAdmin(req.body.email, req.body.password)) {
            throw new Error('Invalid username or password')
        }

        const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRETKEY)
        admin.token = token
        res.cookie("adminTokenSession", token, {httpOnly:true, secure:true});
        res.status(200).send({
            adminToken: token
          })

    } catch (e) {
        res.status(401).send(e.message)
    }
})

router.post('/admin/logout', authorizeAdmin, async (req, res) => {
    admin.token = undefined
    res.send()
})

router.post('/admin/createuser', authorizeAdmin, async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        res.status(201).send({user})
    } catch (e) {
        res.status(400).send(e)
    }
})

const isAdmin = (email, password) => {

    const isMatchAdminPass = bcrypt.compare(password, admin.password)
    if(isMatchAdminPass) {
        return (email === admin.email && password)
    }
}

module.exports = router