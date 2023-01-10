const express = require('express')
const User = require('../models/user')
const Leave = require('../models/leave')
const auth = require('../middleware/auth')
const Notification = require('../models/notification')
const router = new express.Router()
const currentyear = new Date().getFullYear()
const previousYear = currentyear - 1
const nextYear = currentyear + 1
const LastYear = 'January 1, ' + previousYear + ' 00:00:00'
const NextYear = 'December 31, ' + nextYear + ' 00:00:00'
const lastYearDate = new Date(LastYear).getTime()
 //console.log('lastYearDate '+ lastYearDate)
const nextYearDate = new Date(NextYear).getTime()
 //console.log('nextYearDate '+ nextYearDate)

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
        const allReportsList = await User.getAllReports(req.user._id)
        res.status(200).send({ 'recEmpList': allReportsList })

    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

router.patch('/manager/user/changeLeaveStatus', auth, async (req, res) => {
    try {
        const countManager = await User.countDocuments({ managerEmployeeCode: req.user._id })
        if (countManager == 0) {
            throw new Error('User is not manager')
        }
        const changeLeaveStatus = await Leave.findOne({ _id: req.body.id })
        if (!changeLeaveStatus) {
            throw new Error(`Leave data does not exist for date ${req.body.id}`)
        }
        await Leave.checkLeaveBalance(req.body.fromDate, req.body.toDate, changeLeaveStatus.employeeId, req.body.fromSpan, req.body.toSpan, req.user._id)
        changeLeaveStatus.managerNote = req.body.managerNote
        changeLeaveStatus.leaveStatus = req.body.leaveStatus
        if (req.body.leaveStatus == 'Rejected Taken') {
            changeLeaveStatus.leavePlanned = false
        }
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
    }
    catch (e) {
        res.status(400).send({ error: e.message })
    }
})

router.get('/manager/user', auth, async (req, res) => {

    try {
        if (!req.query.userId) {
            throw new Error(`userID is missing`)
        }
        const userData = await User.findOne({ _id: req.query.userId })

        const leaveList = await Leave.find({
            employeeId: userData._id,
            $or: [{ "fromDate": { "$gte": lastYearDate, "$lt": nextYearDate } }]
            // $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, currentyear] } }]
        }).sort({ fromDate: -1 })
        //console.log('mangeruser'+ leaveList)
        for (var i = 0; i < leaveList.length; i++) {
            const calLeaveSpanArray = await Leave.checkLeaveBalance(leaveList[i].fromDate, leaveList[i].toDate, leaveList[i]._id, leaveList[i].fromSpan, leaveList[i].toSpan)
            leaveList[i].leaveCount = calLeaveSpanArray[0]
        }

        const calTotalLeaveBalance = await Leave.calculateLeaveBalance(userData._id)

        const totalLeaveBalance = calTotalLeaveBalance[0]
        const consumeCL = calTotalLeaveBalance[1]
        const consumeEL = calTotalLeaveBalance[2]
        const totalFutureLeave = calTotalLeaveBalance[3]
        const compOffLeave = calTotalLeaveBalance[5]
        res.status(200).send({ 'leaveList': leaveList, 'userData': userData, 'calTotalLeaveBalance': totalLeaveBalance, 'consumeCL': consumeCL, 'consumeEL': consumeEL, 'totalFutureLeave': totalFutureLeave, 'compOffLeave': compOffLeave })
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