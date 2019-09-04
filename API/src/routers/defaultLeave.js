const express = require('express')
const DefaultLeaves = require('../models/defaultLeave')
const User = require('../models/user')
const auth = require('../middleware/auth')
const authorizeAdmin = require('../middleware/adminAuth')
const router = new express.Router()

router.get('/settings/defaultleaves/list', authorizeAdmin, async (req, res) => {
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }
        const defaultLeaveList = await DefaultLeaves.find()
        res.status(201).send({ 'defaultLeaveList': defaultLeaveList })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/hr/settings/defaultleaves/list', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        const defaultLeaveList = await DefaultLeaves.find()
        res.status(201).send({ 'defaultLeaveList': defaultLeaveList })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/settings/defaultleaves/add', authorizeAdmin, async (req, res) => {
    console.log('Default leaves')
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }
        console.log(req.body)
        // const dept = await Department.findOne({ departmentName })
        // if(dept){
        //     throw new Error ('Duplicate Department')
        // } 
        const defaultLeaves = new DefaultLeaves(req.body)
        await defaultLeaves.save()
        res.status(201).send({ 'defaultLeaves': defaultLeaves })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.patch('/settings/defaultleaves/edit', authorizeAdmin, async (req, res) => {
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }
        console.log(req.body)
        const defaultLeaveId = req.body.defaultLeavesId
        if (!defaultLeaveId) {
            throw new Error('Data is missing')
        }
        const existingDeafultLeave = await DefaultLeaves.findOne({ _id: defaultLeaveId })

        if (!existingDeafultLeave) {
            throw new Error(`${req.body.defaultLeavesId} not found`)
        }

        const updates = Object.keys(req.body)
        // // const allowedUpdates = ['departmentName']
        // // const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        // // if (!isValidOperation) {
        // //     throw new Error('Invalid updates!')
        // // }

        updates.forEach((update) => existingDeafultLeave[update] = req.body[update])
        await existingDeafultLeave.save()
        res.send(existingDeafultLeave)
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})


module.exports = router