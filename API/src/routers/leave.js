const express = require('express')
const User = require('../models/user')
const Leave = require('../models/leave')
const auth = require('../middleware/auth')
const Holiday = require('../models/holiday')
const Notification = require('../models/notification')
const router = new express.Router()
const currentyear = new Date().getFullYear()

router.get('/user/leave/list', auth, async (req, res) => {
    try {
        const leaveList = await Leave.find({
            employeeId: req.user._id,
            // $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, currentyear] } }]
        }).sort({ fromDate: -1 }).limit(5)
        for (var i = 0; i < leaveList.length; i++) {
            const calLeaveSpanArray = await Leave.checkLeaveBalance(leaveList[i].fromDate, leaveList[i].toDate, leaveList[i]._id, leaveList[i].fromSpan, leaveList[i].toSpan)
            leaveList[i].leaveCount = calLeaveSpanArray[0]
        }

        const userData = await User.find({ _id: req.user._id })
        res.status(200).send({ 'leaveList': leaveList, 'userData': userData })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/user/leave/checkLeaveSpan', auth, async (req, res) => {

    try {
        await Leave.checkLeaveData(req.body.fromDate, req.body.toDate, req.body.reason, req.user._id, req.body.fromSpan, req.body.toSpan)
        const leaveSpan = await Leave.checkLeaveBalance(req.body.fromDate, req.body.toDate, req.user._id, req.body.fromSpan, req.body.toSpan)

        res.status(201).send({ 'leaveSpan': leaveSpan })

    } catch (e) {
        res.status(400).send(e.message)

    }
})

// router.post('/user/leave/leaveSpanCount', auth, async (req, res) => {
//     try{
//         const leaveSpan = await Leave.checkLeaveBalance(req.body.fromDate, req.body.toDate, req.user._id)

//         res.status(201).send({ 'leaveSpan': leaveSpan })
//     } catch (e) {
//         res.status(400).send(e.message)

//     }
// })

router.post('/user/leave/calculateTotalLeaveBalance', auth, async (req, res) => {
    try {
        const calTotalLeaveBalance = await Leave.calculateLeaveBalance(req.user._id)
        const totalLeaveBalance = calTotalLeaveBalance[0]
        const consumeCL = calTotalLeaveBalance[1]
        const consumeEL = calTotalLeaveBalance[2]
        const totalFutureLeave = calTotalLeaveBalance[3]
        res.status(201).send({ 'calTotalLeaveBalance': totalLeaveBalance, 'consumeCL': consumeCL, 'consumeEL': consumeEL, 'totalFutureLeave': totalFutureLeave })

    } catch (e) {
        res.status(400).send(e.message)

    }
})

router.post('/user/leave/checkHoliday', auth, async (req, res) => {
    try {
        const checkFromDateHoliday = await Holiday.findOne({ date: req.body.fromDate })
        if (checkFromDateHoliday) {
            throw new Error(`Can not apply leave, From date ${checkFromDateHoliday.date} is holiday`)
        }

        const checktoDateHoliday = await Holiday.findOne({ date: req.body.toDate })
        if (checktoDateHoliday) {
            throw new Error(`Can not apply leave, To date ${checktoDateHoliday.date} is holiday`)
        }
        const leaveSpan = await Leave.calLeaveSpan(req.body.fromDate, req.body.toDate, req.body.fromSpan, req.body.toSpan)
        res.status(201).send({ 'leaveSpan': leaveSpan })
    } catch (e) {
        res.status(400).send(e.message)
    }
})
router.post('/user/leave/apply', auth, async (req, res) => {
    try {
        await Leave.checkLeaveData(req.body.fromDate, req.body.toDate, req.body.reason, req.user._id, req.body.fromSpan, req.body.toSpan)
        const leaveSpan = await Leave.checkLeaveBalance(req.body.fromDate, req.body.toDate, req.user._id)
        //  Check leave balance is suficient or not 
        const userData = await User.findOne({ _id: req.user._id })
        const leaveAppData = new Leave(req.body)
        leaveAppData.leavePlanned = true
        // if (new Date(req.body.fromDate) < new Date() && new Date(req.body.toDate) < new Date()) {
        //     leaveAppData.leaveStatus = 'Taken'
        //     leaveAppData.leavePlanned = false
        // }
        leaveAppData.leaveType = 'EL'
        leaveAppData.employeeId = req.user._id
        leaveAppData.leaveCount = undefined
        leaveAppData.managerNote = undefined
        await leaveAppData.save(function (err, addedLeave) {
            if (err) throw err;
            const notification = new Notification()
            notification.leaveId = addedLeave._id
            notification.fromId = req.user._id
            notification.toId = userData.managerEmployeeCode
            notification.notificationStatus = 'Applied for leave'
            notification.save()
        });
        res.status(201).send({ 'Data': leaveAppData })
    } catch (e) {
        res.status(400).send(e.message)
    }
})


// Create static ApplyLeave(from, to, reason) use for both apply and update
// For update : first delete leave by ID, then use ApplyLeave function, and then if successful, return status, if not, add back the original leave, and return error
router.post('/user/leave/update', auth, async (req, res) => {
    let previousLeaveData
    try {
        const queryId = req.body.id

        if (!queryId) {
            throw new Error('Leave application is missing')
        }

        const leaveApp = await Leave.findOne({ _id: queryId })

        if (!leaveApp) {
            throw new Error(`Leave application of id : ${queryId} not found`)
        }
        if (leaveApp.leaveStatus == 'Approved' || leaveApp.leaveStatus == 'Rejected' || leaveApp.leaveStatus == 'Cancelled' || leaveApp.leaveStatus == 'Rejected Taken' || leaveApp.leaveStatus == 'Approved Taken') {
            throw new Error(`Can not update Approved/Rejected/Cancelled/Taken leave application`)
        }
        previousLeaveData = leaveApp // Object.assign({}, leaveApp)
        await leaveApp.remove()
        await Leave.checkLeaveData(req.body.fromDate, req.body.toDate, req.body.reason, req.user._id, req.body.fromSpan, req.body.toSpan)
        await Leave.checkLeaveBalance(req.body.fromDate, req.body.toDate, req.user._id, req.body.fromSpan, req.body.toSpan)
        const userData = await User.findOne({ _id: req.user._id })
        const upLeaveApp = new Leave(req.body)
        upLeaveApp.leavePlanned = true
        // if (new Date(req.body.fromDate) < new Date() && new Date(req.body.toDate) < new Date()) {
        //     upLeaveApp.leaveStatus = 'Taken'
        //     upLeaveApp.leavePlanned = false
        // }
        upLeaveApp.leaveType = 'EL'
        upLeaveApp.employeeId = req.user._id
        upLeaveApp.leaveCount = undefined
        upLeaveApp.managerNote = undefined
        await upLeaveApp.save(function (err, updatedLeave) {
            if (err) throw err;
            const notification = new Notification()
            notification.leaveId = updatedLeave._id
            notification.fromId = req.user._id
            notification.toId = userData.managerEmployeeCode
            notification.notificationStatus = 'Updated leave'
            notification.save()
        });
        res.status(201).send({ 'Data': upLeaveApp })

    } catch (e) {
        if (previousLeaveData) {
            const upPreviousLeaveApp = new Leave(previousLeaveData._doc)
            await upPreviousLeaveApp.save()
            res.status(400).send({ 'Error': e.message })

        } else {
            res.status(400).send(e.message)
        }
    }
})

router.get('/user/leave/cancel', auth, async (req, res) => {
    try {
        if (!req.query.leaveId) {
            throw new Error('Leave Id is missing')
        }
        const selectedLeaveData = await Leave.findOne({ _id: req.query.leaveId })
        selectedLeaveData.leaveStatus = 'Cancelled'
        await selectedLeaveData.save()
        res.status(200).send({ 'cancelledStatus': selectedLeaveData })

    } catch (e) {
        res.status(400).send(e.message)
    }

})

router.delete('/user/leave/delete', auth, async (req, res) => {

    try {

        const queryId = req.query.id

        if (!queryId) {
            throw new Error('Leave application is missing')
        }

        const leaveApp = await Leave.findOne({ _id: queryId })

        if (!leaveApp) {
            throw new Error(`Leave application of id : ${queryId} not found`)
        }
        if (leaveApp.leaveStatus == 'Approved' || leaveApp.leaveStatus == 'Rejected' || leaveApp.leaveStatus == 'Cancelled' || leaveApp.leaveStatus == 'Rejected Taken' || leaveApp.leaveStatus == 'Approved Taken') {
            throw new Error(`Can not update Approved/Rejected/Cancelled/Taken leave application`)
        }

        await leaveApp.remove()
        res.send({ status: ` ${queryId} Deleted successfully` })

    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/user/leave/datesOfLeave', auth, async (req, res) => {
    try {
        var leaveSpan = await Leave.checkLeaveBalance(req.body.fromDate, req.body.toDate, req.user._id)
        const leaveDates = await Leave.datesOfLeave(req.body.fromDate, req.body.toDate, leaveSpan);
        res.status(200).send({ 'leaveDates': leaveDates })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

module.exports = router
