const express = require('express')
const CompensationOff = require('../models/compensationoff')
const LeaveData = require('../models/leavedata')
const Notification = require('../models/notification')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()
const currentyear = new Date().getFullYear()

router.get('/user/compOff/list', auth, async (req, res) => {
    try {
        const compOffList = await CompensationOff.find({
            employeeId: req.user._id
           // $or: [{ "$expr": { "$eq": [{ "$year": "$fromDateCO" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDateCO" }, currentyear] } }]
        })
        for (var i = 0; i < compOffList.length; i++) {
            const calCompOffSpanArray = await CompensationOff.calCompOffSpan(compOffList[i].fromDateCO, compOffList[i].toDateCO, compOffList[i].fromSpanCO, compOffList[i].toSpanCO)
            compOffList[i].compOffSpan = calCompOffSpanArray
        }

        res.status(200).send({ 'compOffList': compOffList })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/user/compOff/selecteduserlist', auth, async (req, res) => {
    try {
        if(!req.query.userId){
            throw new Error('User Id missing')
        }
        const compOffList = await CompensationOff.find({
            employeeId: req.query.userId,
            $or: [{ "$expr": { "$eq": [{ "$year": "$fromDateCO" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDateCO" }, currentyear] } }]
        })
        for (var i = 0; i < compOffList.length; i++) {
            const calCompOffSpanArray = await CompensationOff.calCompOffSpan(compOffList[i].fromDateCO, compOffList[i].toDateCO, compOffList[i].fromSpanCO, compOffList[i].toSpanCO)
            compOffList[i].compOffSpan = calCompOffSpanArray
        }

        res.status(200).send({ 'compOffList': compOffList })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/user/compOff/checkDate', auth, async (req, res) => {
    try {
        await CompensationOff.checkCompOffDates(req.body, req.user._id)
        const compOffSpan = await CompensationOff.calCompOffSpan(req.body.fromDateCO, req.body.toDateCO, req.body.fromSpanCO, req.body.toSpanCO)
        res.status(200).send({ 'compOffSpan': compOffSpan })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/user/compOff/apply', auth, async (req, res) => {
    try {
        await CompensationOff.applyCompOff(req.body, req.user._id)
        res.status(201).send()
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/user/compOff/update', auth, async (req, res) => {
    try {
        const checkCompOff = await CompensationOff.findOne({
            _id: req.body._id, employeeId: req.body.employeeId
        })
        //, fromDateCO: req.body.fromDateCO, toDateCO: req.body.toDateCO
        if (!checkCompOff) {
            throw new Error('Comp Off is not found')
        }
        // await CompensationOff.checkCompOffDates(req.body, req.body.employeeId) 
        checkCompOff.reasonCO = req.body.reasonCO
        checkCompOff.fromSpanCO = req.body.fromSpanCO
        checkCompOff.toSpanCO = req.body.toSpanCO
        checkCompOff.statusCO = 'Pending'
        await checkCompOff.save()
        res.status(200).send()
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/user/compOff/cancel', auth, async (req, res) => {
    try {
        if (!req.query.compOffId) {
            throw new Error('Id is missing')
        }
        const cancelCompOff = await CompensationOff.findOne({
            employeeId: req.user._id, _id: req.query.compOffId
        })

        if (cancelCompOff.statusCO == 'Approved' && new Date(cancelCompOff.fromDateCO) < new Date()) {
            throw new Error('Can not cancelled leave')
        }
        var compOffSpan = await CompensationOff.calCompOffSpan(cancelCompOff.fromDateCO, cancelCompOff.toDateCO, cancelCompOff.fromSpanCO, cancelCompOff.toSpanCO)

        cancelCompOff.statusCO = 'Cancelled'
        await cancelCompOff.save()

        const getLeaveData = await LeaveData.findOne({
            employeeId: req.user._id, year: currentyear
        })
        if (getLeaveData.compOffLeave != 0) {
            getLeaveData.compOffLeave = getLeaveData.compOffLeave - compOffSpan
            await getLeaveData.save()
        }

        res.status(200).send()
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.patch('/user/compOff/changecompoffstatus', auth, async (req, res) => {
    const countManager = await User.countDocuments({ managerEmployeeCode: req.user._id })
    if (countManager == 0) {
        throw new Error('User is not manager')
    }
    const changecompOffStatus = await CompensationOff.findOne({ _id: req.body._id })
    if (!changecompOffStatus) {
        throw new Error(`Data does not exist for ${req.body.id}`)
    }
    changecompOffStatus.statusCO = req.body.statusCO
    await changecompOffStatus.save(function (err, changecompstatus) {
        if (err) throw err;
        const notification = new Notification()
        notification.leaveId = changecompOffStatus._id
        notification.fromId = req.user._id
        notification.toId = changecompOffStatus.employeeId
        notification.notificationStatus = `Changed Compoff Status to ${changecompstatus.statusCO}`
        notification.save()
    })
    res.status(200).send()
})
module.exports = router