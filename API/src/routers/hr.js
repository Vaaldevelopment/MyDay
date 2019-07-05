const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()


router.post('/hr/user/create', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        const newUser = new User(req.body)
        await newUser.save()
        res.status(201).send({ 'user': newUser })
    } catch (e) {
        res.status(400).send(e)
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

        const updates = Object.keys(req.body)
        const allowedUpdates = ['employeeCode', 'firstName', 'lastName', 'email', 'managerEmployeeCode', 'department', 'employeeStatus', 'dateOfJoining', 'password']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        if (!isValidOperation) {
            throw new Error('Invalid updates!')
        }

        updates.forEach((update) => user[update] = req.body[update])
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

        const employeeCode = req.query.employeecode
        
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