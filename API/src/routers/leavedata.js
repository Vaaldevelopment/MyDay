const express = require('express')
const User = require('../models/user')
const LeaveData = require('../models/leavedata')
const auth = require('../middleware/auth')
const router = new express.Router()
const currentyear = new Date().getFullYear()

router.post('/user/leavedata/add', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }


        const checkEmpData = await LeaveData.findOne({
            employeeId: req.body.employeeId, year: req.body.year
        })

        if (!checkEmpData) {
            const employeeLeaveData = new LeaveData(req.body)
            await employeeLeaveData.save()
            res.status(200).send({ 'message': 'Employee data added successfully' })
        } else {
            const updates = Object.keys(req.body)
            //ToDo- Update Validation Not  working 
            // const allowedUpdates = ['employeeCode', 'firstName']
            // const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
            // if (!isValidOperation) {
            //     throw new Error('Invalid updates!')
            // }
            updates.forEach((update) => checkEmpData[update] = req.body[update])
            await checkEmpData.save()
            res.status(200).send({ 'message': 'Employee data updated successfully' })
        }

    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

router.get('/user/leavedata/employee', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        if (!req.query.year) {
            throw new Error('Year not selected')
        }
        if (!req.query.empId) {
            throw new Error('Employee not selected')
        }

        const empLeaveData = await LeaveData.find({
            employeeId: req.query.empId, year: req.query.year
        })
        res.status(200).send({ 'empLeaveData': empLeaveData })
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

module.exports = router