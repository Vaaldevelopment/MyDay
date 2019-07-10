const express = require('express')
const User = require('../models/user')
const Leave = require('../models/leave')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/user/leave/list', auth, async (req, res) => {
    try {
        const leaveList = await Leave.findOne({ employeeCode: req.user.employeeCode })
        res.send(leaveList)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/user/leave/apply', auth, async (req, res) => {

    try {
        const leaveStatus = await Leave.findOne({ 'employeeCode': req.body.employeeCode })

        if (leaveStatus) {
            const applyDate = new Date(leaveStatus.createdAt)
            const leaveApplyDate = applyDate.setHours(0, 0, 0, 0)
            const date = new Date().setHours(0, 0, 0, 0)
            if (leaveApplyDate == date)
                throw new Error('Can not apply for more than one leave in a single day')
        }

        if (req.body.toDate < req.body.fromDate) {
            throw new Error('To Date is invalid')
        }
        const leaveApp = new Leave(req.body)
        await leaveApp.save()
        res.status(201).send({ 'leave': leaveApp })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

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
        const updateFields = Object.keys(req.body)
        const allowedUpdateFields = ['reason', 'leaveType', 'fromDate', 'toDate']
        const isValidOperation = updateFields.every((update) => allowedUpdateFields.includes(update))
        if (!isValidOperation) {
            throw new Error('Invalid updates!')
        }
        if (req.body.toDate < req.body.fromDate) {
            throw new Error('To Date is invalid')
        }
        updateFields.forEach((update) => leaveApp[update] = req.body[update])
        await leaveApp.save()
        res.send(leaveApp)

    } catch (e) {
        res.status(400).send({ error: e.message })
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