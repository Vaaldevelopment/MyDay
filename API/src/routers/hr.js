const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()


router.get('/hr/user/list', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        const users = await User.userList()
        res.status(200).send({ 'users': users })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/hr/user/checkDuplicateEmpCode', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
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

router.post('/hr/user/create', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        const reqUserData = req.body
        const newUser = await User.createUser(reqUserData)
        res.status(201).send({ 'user': newUser })
    } catch (e) {
        res.status(400).send(e.message)
    }
})


router.patch('/hr/user/update', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        const reqUpdateUserData = req.body
        const user = await User.updateUser(reqUpdateUserData)
        res.status(200).send({ 'user': user })
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

router.delete('/hr/user/delete', auth, async (req, res) => {

    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        const employeeCode = req.query.employeeCode
        const emp = await User.deleteUser(employeeCode)
        res.send({ status: ` ${employeeCode} Deleted successfully` })
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

module.exports = router