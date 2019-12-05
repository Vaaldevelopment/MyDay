const express = require('express')
const User = require('../models/user')
const LeaveData = require('../models/leavedata')
const Leave = require('../models/leave')
const DefaultLeaves = require('../models/defaultLeave')
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

        const calEmployeeBalanceLeave = await Leave.calculateLastYearLeaveBalance(req.query.empId, req.query.year)
        const employeeBalanceLeave = calEmployeeBalanceLeave[0]
        // const consumeCL = calEmployeeBalanceLeave[1]
        // const consumeEL = calEmployeeBalanceLeave[2]
        // const totalFutureLeave = calEmployeeBalanceLeave[3]
        res.status(200).send({ 'empLeaveData': empLeaveData, 'employeeBalanceLeave': employeeBalanceLeave })
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

router.post('/leavedata/toall', auth, async (req, res) => {
    try {

        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }

        const allEmployee = await User.find({
            employeeStatus: { $in: ['Confirmed', 'Probationary'] }, employeeType: 'Permanent'
        })

        for (let i = 0; i < allEmployee.length; i++) {
            const checkAllreadyAdded = await LeaveData.findOne({ employeeId: allEmployee[i]._id, year: req.body.year })
            if (checkAllreadyAdded) {
                checkAllreadyAdded.earnedLeave = req.body.earnedLeave
                checkAllreadyAdded.casualLeave = req.body.casualLeave
                await checkAllreadyAdded.save()
            } else {
                const employeeLeaveData = new LeaveData({ employeeId: allEmployee[i]._id, year: req.body.year, earnedLeave: req.body.earnedLeave, casualLeave: req.body.casualLeave })
                await employeeLeaveData.save()
            }
        }
        res.status(201).send({ 'Message': 'Added leaves to all employee successfuly' })
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

router.get('/leavedata/defaultleave', auth, async (req, res) => {
    try {
        const deafatLeaveData = await DefaultLeaves.findOne({ year: req.query.year })
        res.status(200).send({ 'deafatLeaveData': deafatLeaveData })
    } catch (e) {
        res.status(400).send({ error: e.message })
    }

})

router.get('/leavedata/defaultleaveEntry', auth, async (req, res) => {
    try {
        const defaultLeaves = await DefaultLeaves.find()
        res.status(200).send({ 'defaultLeaves': defaultLeaves })
    } catch (e) {
        res.status(400).send({ error: e.message })
    }

})


module.exports = router