const express = require("express")
const Attendance = require('../models/attendance')
const auth = require('../middleware/auth')
const authorizeAdmin = require('../middleware/adminAuth')
const currentYear = new Date().getFullYear()
const router = new express.Router()

router.get('/hr/attendance/list', auth, async (req,res) =>{
    console.log('Listing Attendance')
    try{
        if(!req.user.isHR){
            throw new Error('User is not HR')
        }
        console.log('Attendance')
        const attendance = await Attendance.getAttendance()
        res.status(201).send({'attendance': attendance})
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/admin/attendance/list', auth, async (req,res) =>{
    try{
        if(!process.env.ADMINTOKEN){
            throw new Error('User is not Admin')
        }
        console.log('Attendance')
        const attendance = await Attendance.getAttendance()
        res.status(201).send({'attendance': attendance})
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/user/attendance/list', auth, async (req,res) =>{
    try{
        console.log('Attendance of '+req.user.employeeCode )
        const attendance = await Attendance.getAttendance(req.user.employeeCode)
        res.status(201).send({'attendance': attendance})
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/hr/attendance/add', auth, async (req,res) =>{
    try{
        if(!req.user.isHR){
            throw new Error('User is not HR')
        }
        const reqAttendanceDate = req.body
         const attendance = await Attendance.addAttendance(reqAttendanceDate)
        res.status(201).send({'attendance': attendance})
    }catch(e){
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
    console.log(req.query)
    try {

        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }

        //const reqDeleteAttendanceData = req.query._id
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