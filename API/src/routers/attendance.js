const express = require("express")
const Attendance = require('../models/attendance')
const User = require('../models/user')
const auth = require('../middleware/auth')
const authorizeAdmin = require('../middleware/adminAuth')
const currentYear = new Date().getFullYear()

const router = new express.Router()

router.get('/hr/attendance/list', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        if (!req.query.employeeId) {
            throw new Error('Employee missing')
        }
        const attendance = await Attendance.getAttendance(req.query.employeeId)
        res.status(200).send({ attendance })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/admin/attendance/list', auth, async (req, res) => {
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }

        if (!req.query.employeeId) {
            throw new Error('Employee missing')
        }
        const attendance = await Attendance.getAttendance(req.query.employeeId)
        res.status(200).send({ attendance })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/manager/attendance/list', auth, async (req, res) => {
    try {
        if (!req.query.employeeId) {
            throw new Error('Employee missing')
        }

        const isManager = await Attendance.isManagerOf(req.user._id, req.query.employeeId)
        if (!isManager) {
            // throw new Error(`Employee not reporting to ${req.user.firstName}`)
        }
        const attendance = await Attendance.getAttendance(req.query.employeeId)
        res.status(200).send({ 'attendance': attendance })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/user/attendance/list', auth, async (req, res) => {
    try {
        const attendance = await Attendance.getAttendance(req.user._id)
        console.log('req.user._id '+ req.user._id);
        console.log('attendance ' + attendance);
        res.status(200).send({ 'attendance': attendance })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/hr/attendance/add', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        const reqAttendanceDate = req.body
        const attendance = await Attendance.addAttendance(reqAttendanceDate)
        res.status(201).send({ 'attendance': attendance })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.patch('/hr/attendance/update', auth, async (req, res) => {
    try {

        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }

        if (!req.body.inTime) {
            throw new Error('Please enter In Time')
        }
        if (!req.body.outTime) {
            throw new Error('Please enter Out Time')
        }
        const reqUpdateAttendanceData = req.body
        const updateAttendance = await Attendance.updateAttendance(reqUpdateAttendanceData)
        res.status(201).send({ 'attendance': updateAttendance })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.delete('/hr/attendance/delete', auth, async (req, res) => {
    try {

        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }

        const removeAttendance = await Attendance.deleteAttendance(req.query)
        res.send(`Attendance removed succefully`)

    } catch (e) {
        res.status(400).send(e.message)
    }
})


router.get('/test', async (req, res) => {
    res.send('test')
})
module.exports = router