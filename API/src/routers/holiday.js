const express = require('express')
const Holiday = require('../models/holiday')
const auth = require('../middleware/auth')
const authorizeAdmin = require('../middleware/adminAuth')
const currentyear = new Date().getFullYear()

const router = new express.Router()

router.get('/hr/holiday/list', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        console.log('Holiday list')
        const holidays = await Holiday.getHolidayList()
        res.status(201).send({ 'holidays': holidays })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/admin/holiday/list', authorizeAdmin, async (req, res) => {
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }
        const holidays = await Holiday.getHolidayList()
        res.status(201).send({ 'holidays': holidays })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/user/holiday/list', auth, async (req, res) => {
    try {
        const holidays = await Holiday.getHolidayList()
        res.status(201).send({ 'holidays': holidays })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/hr/holiday/add', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        const reqHolidayData = req.body;
        const holiday = await Holiday.addHoliday(reqHolidayData)
        res.status(201).send({ 'holiday': holiday })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/admin/holiday/add', authorizeAdmin, async (req, res) => {
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }
        const reqHolidayData = req.body;
        const holiday = await Holiday.addHoliday(reqHolidayData)
        res.status(201).send({ 'holiday': holiday })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.patch('/hr/holiday/update', auth, async (req, res) => {
    try {

        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }

        if (!req.body.description) {
            throw new Error('Please enter description')
        }
        const reqUpdateHolidayData = req.body
        const updateHoliday = await Holiday.updateHoliday(reqUpdateHolidayData)
        res.status(201).send({ 'holiday': updateHoliday })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.patch('/admin/holiday/update', authorizeAdmin, async (req, res) => {
    try {

        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }

        if (!req.body.description) {
            throw new Error('Please enter description')
        }
        const reqUpdateHolidayData = req.body
        const updateHoliday = await Holiday.updateHoliday(reqUpdateHolidayData)
        res.status(201).send({ 'holiday': updateHoliday })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.delete('/hr/holiday/delete', auth, async (req, res) => {
    try {

        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }

        if (!req.query.date) {
            throw new Error('Please specify a date')
        }

        const validDate = new Date(req.query.date)
        if (!validDate) {
            throw new Error('Please enter a valid date')
        }
        const reqDeleteHolidayData = req.query.date
        const removeHoliday = await Holiday.deleteHoliday(reqDeleteHolidayData)
        res.send(`Remove holiday successful for ${reqDeleteHolidayData.date}`)

    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.delete('/admin/holiday/delete', authorizeAdmin, async (req, res) => {
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }

        if (!req.query.date) {
            throw new Error('Please specify a date')
        }

        const validDate = new Date(req.query.date)
        if (!validDate) {
            throw new Error('Please enter a valid date')
        }
        const reqDeleteHolidayData = req.query.date
        const removeHoliday = await Holiday.deleteHoliday(reqDeleteHolidayData)
        res.send(`Remove holiday successful for ${reqDeleteHolidayData.date}`)

    } catch (e) {
        res.status(400).send(e.message)
    }
})

module.exports = router