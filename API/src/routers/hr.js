const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()


router.get('/hr/user/list', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        const users = await User.find().sort({ employeeCode: 1 })
        console.log(users)
        res.send({ 'users': users })
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

router.post('/hr/user/create', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        console.log(req.body)
        const newUser = new User(req.body)
        await newUser.save()
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
        if (!req.body.employeeCode) {
            throw new Error('EmployeeCode missing')
        }
        const user = await User.findOne({ employeeCode: req.body.employeeCode })

        if (!user) {
            throw new Error(`User with employeeCode : ${req.body.employeeCode} not found`)
        }
        console.log(req.body)
        const updates = Object.keys(req.body)
        // const allowedUpdates = ['employeeCode', 'firstName']
        // const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        // if (!isValidOperation) {
        //     throw new Error('Invalid updates!')
        // }

        updates.forEach((update) => user[update] = req.body[update])
        console.log(user)
        await user.save()
        res.send(user)
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
        if (!employeeCode) {
            throw new Error('EmployeeCode missing')
        }

        const user = await User.findOne({ employeeCode })

        if (!user) {
            throw new Error(`User with employeeCode : ${employeeCode} not found`)
        }

        await user.remove()
        res.send({ status: ` ${employeeCode} Deleted successfully` })

    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

module.exports = router