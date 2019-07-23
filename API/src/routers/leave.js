const express = require('express')
const User = require('../models/user')
const Leave = require('../models/leave')
const auth = require('../middleware/auth')
const router = new express.Router()

router.get('/user/leave/list', auth, async (req, res) => {
    try {
        const leaveList = await Leave.find({ employeeCode: req.user.employeeCode })
        res.status(200).send(leaveList)
    } catch (e) {
        res.status(400).send({'Error' : e.message })
    }
})

router.post('/user/leave/apply', auth, async (req, res) => {

    try {

        await Leave.checkLeaveData(req.body.fromDate, req.body.toDate, req.body.reason, req.user.employeeCode)

        //  Check leave balance id suficient or not 

        const leaveApp = new Leave(req.body)
        console.log(req.body)
        leaveApp.leaveType = 'EL'
        leaveApp.leavePlanned = true
        leaveApp.employeeCode = req.user.employeeCode
        await leaveApp.save()
        res.status(201).send({ 'Data': leaveApp })
    } catch (e) {
        res.status(400).send({ 'Error': e.message })
    }
})


// Create static ApplyLeave(from, to, reason) use for both apply and update
// For update : first delete leave by ID, then use ApplyLeave function, and then if successful, return status, if not, add back the original leave, and return error
router.patch('/user/leave/update', auth, async (req, res) => {

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
        const updateLeaveData = await Leave.checkLeaveData(req.body.fromDate, req.body.toDate, req.body.reason, req.user.employeeCode)
        const updateFields = Object.keys(req.body)
        const allowedUpdateFields = ['reason', 'leaveType', 'fromDate', 'toDate']
        const isValidOperation = updateFields.every((update) => allowedUpdateFields.includes(update))
        if (!isValidOperation) {
            throw new Error('Invalid updates!')
        }
        updateFields.forEach((update) => leaveApp[update] = req.body[update])
        await leaveApp.save()
        res.status(200).send()

    } catch (e) {
        res.status(400).send({ 'Error': e.message })
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
        res.status(400).send({ error: e.message })
    }
})

module.exports = router
