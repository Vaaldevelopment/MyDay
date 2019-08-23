const express = require('express')
const admin = require('../models/admin')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const router = new express.Router()

const authorizeAdmin = async (req, res, next) => {
    try {

        console.log('Admin token Value' + process.env.ADMINTOKEN)

        const token = req.header('Authorization').replace('Bearer ', '')
        if (token !== process.env.ADMINTOKEN) {
            throw new Error()
        }
        req.token = token
        next()
    } catch (e) {
        console.log(e.message);
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

router.post('/admin/login', async (req, res) => {
    try {
        if (!isAdmin(req.body.email, req.body.password)) {
            throw new Error('Invalid username or password')
        }

        const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRETKEY)
        process.env.ADMINTOKEN = token
        admin.token = token
        res.cookie("adminTokenSession", token, { httpOnly: true, secure: true });
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
    console.log('in create user');
    const user = new User(req.body)

    try {
        await user.save()
        res.status(201).send({ user })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/admin/user/list', authorizeAdmin, async (req, res) => {
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }
        const users = await User.find().sort({ employeeCode: 1 })
        console.log(users)
        res.send({ 'users': users })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/admin/user/checkDuplicateEmpCode', authorizeAdmin, async (req, res) => {
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }
        const employeeCode = req.query.employeeCode
        const user = await User.findOne({ employeeCode })
        if (user) {
            throw new Error('Duplicate Employee Code')
        } else {
            res.status(200).send();
        }
    } catch (e) {
        res.status(400).send(e.message)
    }
})


const isAdmin = (email, password) => {

    const isMatchAdminPass = bcrypt.compare(password, admin.password)
    if (isMatchAdminPass) {
        return (email === admin.email && password)
    }
}

module.exports = router