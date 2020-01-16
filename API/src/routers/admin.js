const express = require('express')
const admin = require('../models/admin')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const authorizeAdmin = require('../middleware/adminAuth')
const router = new express.Router()

router.post('/admin/login', async (req, res) => {
    // try {
    //     const isMatchAdminPass = bcrypt.compare(req.body.password, admin.password)
    //     console.log(isMatchAdminPass)
    //     if (!isMatchAdminPass) {
    //         throw new Error('Invalid username or password')
    //     }
    //     const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRETKEY)
    //     process.env.ADMINTOKEN = token
    //     admin.token = token
    //     res.cookie("adminTokenSession", token, { httpOnly: true, secure: true });
    //     res.status(200).send({
    //         adminToken: token
    //     })

    // } catch (e) {
    //     res.status(401).send(e.message)
    // }

    // req.body.email, req.body.password
    bcrypt.compare(req.body.password, admin.password).then((result) => {
        if (result) {
            const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRETKEY)
            process.env.ADMINTOKEN = token
            admin.token = token
            res.cookie("adminTokenSession", token, { httpOnly: true, secure: true });
            res.status(200).send({
                adminToken: token
            })
        } else {
            throw new Error('Invalid username or password')
            // do other stuff
        }
    })
        .catch((err) => res.status(400).send('authentication failed.'))
})

router.post('/admin/logout', authorizeAdmin, async (req, res) => {
    admin.token = undefined
    process.env.ADMINTOKEN = null
    res.send()
})

router.post('/admin/createuser', authorizeAdmin, async (req, res) => {
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }
        const reqUserData = req.body
        const user = await User.createUser(reqUserData)
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
        const users = await User.userList()
        const userLeaves = await User.userLeaveCurrentYear()
        res.status(200).send({ 'users': users, 'userLeaves': userLeaves })
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
        const user = await User.checkDuplicate(employeeCode)
        if (user) {
            throw new Error('Duplicate Employee Code')
        } else {
            res.status(200).send();
        }
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.patch('/admin/user/update', authorizeAdmin, async (req, res) => {
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }
        const reqUpdateUserData = req.body
        const user = await User.updateUser(reqUpdateUserData)
        res.status(200).send({ 'user': user })
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

router.delete('/admin/user/delete', authorizeAdmin, async (req, res) => {

    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }
        const employeeCode = req.query.employeeCode
        const emp = await User.deleteUser(employeeCode)
        res.send({ status: ` ${employeeCode} Deleted successfully` })
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

const isAdmin = (email, password) => {

    const isMatchAdminPass = bcrypt.compare(password, admin.password)
    if (isMatchAdminPass) {
        return (email === admin.email && password)
    }
}

module.exports = router