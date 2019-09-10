const express = require('express')
const User = require('../models/user')
const Leave = require('../models/leave')
const auth = require('../middleware/auth')
const router = new express.Router()
const currentyear = new Date().getFullYear()

router.get('/user/leave/list', auth, async (req, res) => {
    try {
        const leaveList = await Leave.find({
            employeeCode: req.user.employeeCode,
            $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, currentyear] } }]
        })
        const userData = await User.find({employeeCode: req.user.employeeCode})
        res.status(201).send({ 'leaveList': leaveList, 'userData' : userData })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/user/leave/checkLeaveSpan', auth, async (req, res) => {
    try {
        await Leave.checkLeaveData(req.body.fromDate, req.body.toDate, req.body.reason, req.user.employeeCode)
        const leaveSpan = await Leave.checkLeaveBalance(req.body.fromDate, req.body.toDate, req.user.employeeCode)
        console.log(leaveSpan)
        res.status(201).send({ 'leaveSpan': leaveSpan })

    } catch (e) {
        res.status(400).send(e.message)

    }
})

router.post('/user/leave/apply', auth, async (req, res) => {
    try {
        await Leave.checkLeaveData(req.body.fromDate, req.body.toDate, req.body.reason, req.user.employeeCode)
        const leaveSpan = await Leave.checkLeaveBalance(req.body.fromDate, req.body.toDate, req.user.employeeCode)

        //  Check leave balance is suficient or not 
        const leaveAppData = new Leave(req.body)
        leaveAppData.leaveType = 'EL'
        leaveAppData.leavePlanned = true
        leaveAppData.employeeCode = req.user.employeeCode
        leaveAppData.leaveCount = leaveSpan[0]
        await leaveAppData.save()
        res.status(201).send({ 'Data': leaveAppData, 'leaveSpan': leaveSpan })
    } catch (e) {
        res.status(400).send(e.message)
    }
})


// Create static ApplyLeave(from, to, reason) use for both apply and update
// For update : first delete leave by ID, then use ApplyLeave function, and then if successful, return status, if not, add back the original leave, and return error
router.post('/user/leave/update', auth, async (req, res) => {
    console.log(req.body)
    let previousLeaveData
    try {
        const queryId = req.body.id
        console.log(req.body.id)
        if (!queryId) {
            throw new Error('Leave application is missing')
        }

        const leaveApp = await Leave.findOne({ _id: queryId })

        if (!leaveApp) {
            throw new Error(`Leave application of id : ${queryId} not found`)
        }
        if (leaveApp.leaveStatus == 'Approved' || leaveApp.leaveStatus == 'Rejected' || leaveApp.leaveStatus == 'Cancelled') {
            throw new Error(`Can not update Approved/Rejected/Cancelled leave application`)
        }
        previousLeaveData = leaveApp // Object.assign({}, leaveApp)
        await leaveApp.remove()

        await Leave.checkLeaveData(req.body.fromDate, req.body.toDate, req.body.reason, req.user.employeeCode)
        const leaveSpan = await Leave.checkLeaveBalance(req.body.fromDate, req.body.toDate, req.user.employeeCode)
        const upLeaveApp = new Leave(req.body)
        upLeaveApp.leaveType = 'EL'
        upLeaveApp.leavePlanned = true
        upLeaveApp.employeeCode = req.user.employeeCode
        upLeaveApp.leaveCount = leaveSpan
        console.log(upLeaveApp)
        await upLeaveApp.save()
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
        if (leaveApp.leaveStatus == 'Approved' || leaveApp.leaveStatus == 'Rejected' || leaveApp.leaveStatus == 'Cancelled') {
            throw new Error(`Can not update Approved/Rejected/Cancelled leave application`)
        }

        await leaveApp.remove()
        res.send({ status: ` ${queryId} Deleted successfully` })

    } catch (e) {
        res.status(400).send(e.message)
    }
})

module.exports = router
