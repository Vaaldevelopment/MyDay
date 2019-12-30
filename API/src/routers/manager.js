const express = require('express')
const User = require('../models/user')
const Leave = require('../models/leave')
const auth = require('../middleware/auth')
const Notification = require('../models/notification')
const router = new express.Router()
const currentyear = new Date().getFullYear()

router.get('/manager/user/list', auth, async (req, res) => {
    try {
        const countManager = await User.countDocuments({ managerEmployeeCode: req.user._id })
        if (countManager == 0) {
            throw new Error('User is not manager')
        }
        const managerEmpList = await User.find({ managerEmployeeCode: req.user._id })
        res.status(200).send({ 'managerEmpList': managerEmpList })
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

        res.status(200).send({ 'recEmpList': descendants })

    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

router.patch('/manager/user/changeLeaveStatus', auth, async (req, res) => {
    const countManager = await User.countDocuments({ managerEmployeeCode: req.user._id })
    if (countManager == 0) {
        throw new Error('User is not manager')
    }
    const changeLeaveStatus = await Leave.findOne({ _id: req.body.id })
    if (!changeLeaveStatus) {
        throw new Error(`Leave data does not exist for date ${req.body.id}`)
    }
    changeLeaveStatus.managerNote = req.body.managerNote
    changeLeaveStatus.leaveStatus = req.body.leaveStatus
    await changeLeaveStatus.save(function (err, changeLeavestatus) {
        if (err) throw err;
        const notification = new Notification()
        notification.leaveId = changeLeavestatus._id
        notification.fromId = req.user._id
        notification.toId = changeLeaveStatus.employeeId
        notification.notificationStatus = `Changed Leave Status to ${changeLeavestatus.leaveStatus}`
        notification.save()
    })
    res.status(200).send({ 'leaveStatus': changeLeaveStatus })
})

router.get('/manager/user', auth, async (req, res) => {

    try {
        if (!req.query.userId) {
            throw new Error(`userID is missing`)
        }
        const userData = await User.findOne({ _id: req.query.userId })
       
        const leaveList = await Leave.find({
            employeeId: userData._id,
           // $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, currentyear] } }]
        }).sort({ fromDate: 1 })
        for (var i = 0; i < leaveList.length; i++) {
            const calLeaveSpanArray = await Leave.checkLeaveBalance(leaveList[i].fromDate, leaveList[i].toDate, leaveList[i]._id)
            leaveList[i].leaveCount = calLeaveSpanArray[0]
        }
       
        const calTotalLeaveBalance = await Leave.calculateLeaveBalance(userData._id)
       
        const totalLeaveBalance = calTotalLeaveBalance[0]
        const consumeCL = calTotalLeaveBalance[1]
        const consumeEL = calTotalLeaveBalance[2]
        const totalFutureLeave = calTotalLeaveBalance[3]
        res.status(200).send({ 'leaveList': leaveList, 'userData': userData, 'calTotalLeaveBalance': totalLeaveBalance, 'consumeCL': consumeCL, 'consumeEL': consumeEL, 'totalFutureLeave': totalFutureLeave })
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

router.post('/manager/user/checklist', auth, async (req, res) => {
    try {
        const checkListUser = []
        const checkListUserLeave = []
        const checkListArray = req.body
        for (var i = 0; i < checkListArray.length; i++) {
            checkListUser[i] = await User.findOne({ _id: checkListArray[i] })
        }
        for (var i = 0; i < checkListUser.length; i++) {
            checkListUserLeave[i] = await Leave.find({ employeeId: checkListUser[i]._id })
        }

        res.status(201).send({ 'checkListUser': checkListUser, 'checkListUserLeave': checkListUserLeave })
    } catch (e) {
        res.status(400).send({ error: e.message })
    }


})

module.exports = router