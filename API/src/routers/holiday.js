const express = require('express')
const Holiday = require('../models/holiday')
const auth = require('../middleware/auth')
const currentyear = new Date().getFullYear()

const router = new express.Router()

router.get('/hr/holiday/list', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }

        const holidays = await Holiday.find({ "$expr": { "$eq": [{ "$year": "$date" }, currentyear] } })
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

        const existingHoliday = await Holiday.findOne({ date: req.body.date, "$expr": { "$eq": [{ "$year": "$date" }, currentyear] } })
        if (existingHoliday) {
            throw new Error(`Holiday already exist for date ${req.body.date}`)
        }
        const holiday = await new Holiday(req.body).save()
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
        const existingHoliday = await Holiday.findOne({ date: req.body.date, "$expr": { "$eq": [{ "$year": "$date" }, currentyear] } })

        if (!existingHoliday) {
            throw new Error(`Holiday does not exist for date ${req.body.date}`)
        }

        existingHoliday.description = req.body.description
        await existingHoliday.save()
        res.status(201).send({ 'holiday': existingHoliday })
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

        const existingHoliday = await Holiday.findOne({ date: req.query.date, "$expr": { "$eq": [{ "$year": "$date" }, currentyear] } })

        if (!existingHoliday) {
            throw new Error(`Holiday does not exist for date ${req.query.date}`)
        }

        await existingHoliday.remove()
        res.send(`Remove holiday successful for ${req.query.date}`)

    } catch (e) {
        res.status(400).send(e.message)
    }
})

module.exports = router