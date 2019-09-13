const express = require('express')
const User = require('../models/user')
const Leave = require('../models/leave')
const auth = require('../middleware/auth')
const router = new express.Router()

router.get('/manager/user/list', auth, async (req, res) => {
    try {
        const countManager = await User.countDocuments({ managerEmployeeCode: req.user._id })
        if (countManager == 0) {
            throw new Error('User is not manager')
        }
        const managerEmpList = await User.find({ managerEmployeeCode: req.user._id })
        res.status(201).send({'managerEmpList' :managerEmpList})
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

router.get('/manager/user/reclist', auth, async (req, res) => {
    try {
        const countManager = await User.countDocuments({ managerEmployeeCode: req.user._id })
        if (countManager == 0) {
            throw new Error('User is not manager')
        }
        const descendants = []
        const stack = [];
        const item = await User.findOne({ _id: req.user._id })
        stack.push(item)

        while (stack.length > 0) {
            var currentnode = stack.pop()
            var children = await User.find({ managerEmployeeCode: { $in: currentnode._id } })
            children.forEach(child => {
                descendants.push(child)
                stack.push(child);
            });
        }
        
        res.status(201).send({'recEmpList':descendants})

    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

router.patch('/manager/user/changeLeaveStatus', auth, async (req, res) => {
    const countManager = await User.countDocuments({ managerEmployeeCode: req.user.employeeCode })
    if (countManager == 0) {
        throw new Error('User is not manager')
    }
    const changeLeaveStatus = await Leave.findOne({ _id: req.query.leaveId })
    if (!changeLeaveStatus) {
        throw new Error(`Leave data does not exist for date ${req.body._id}`)
    }
    changeLeaveStatus.managerNote = req.body.managerNote
    changeLeaveStatus.leaveStatus = req.body.leaveStatus
    await changeLeaveStatus.save()
    res.send(changeLeaveStatus)
})

module.exports = router