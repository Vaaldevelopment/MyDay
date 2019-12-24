const express = require('express')
const CompensationOff = require('../models/compensationoff')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')
const router = new express.Router()
const currentyear = new Date().getFullYear()

router.get('/user/compOff/list', auth, async (req, res) => {
    try {
        const compOffList = await CompensationOff.find({
            employeeId: req.user._id,
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
        res.status(200).send({'compOffSpan' : compOffSpan})
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
            _id: req.body._id, employeeId: req.body.employeeId, fromDateCO: req.body.fromDateCO, toDateCO: req.body.toDateCO
        })
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
        if(cancelCompOff.statusCO == 'Approved' && new Date(cancelCompOff.fromDateCO) < new Date()){
            throw new Error('Can not cancelled leave')
        }
        cancelCompOff.statusCO = 'Cancelled'
        await cancelCompOff.save()
        res.status(200).send()
    } catch (e) {
        res.status(400).send(e.message)
    }
})
module.exports = router