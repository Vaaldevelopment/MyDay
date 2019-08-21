const express = require('express')
const Department = require('../models/department')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()
// Check Duplicate
router.post('/settings/department/add', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        const department = new Department(req.body)
        await department.save()
        res.status(201).send({ 'department': department })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

//Not need to check dupliacte seperately
router.get('/settings/department/checkDuplicatedepartment', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        const departmentName = req.query.departmentString
        const dept = await Department.findOne({ departmentName })
        if(dept){
            throw new Error ('Duplicate Department')
        } else {
            res.status(200).send();
        }
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.patch('/settings/department/edit', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        const deptId = req.query.deptId
        if (!deptId) {
            throw new Error('Department is missing')
        }
        const existingDepartment = await Department.findOne({ _id: deptId })

        if (!existingDepartment) {
            throw new Error(`${req.body.deptId} not found`)
        }

        const updates = Object.keys(req.body)
        const allowedUpdates = ['departmentName']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        if (!isValidOperation) {
            throw new Error('Invalid updates!')
        }

        updates.forEach((update) => existingDepartment[update] = req.body[update])
        await existingDepartment.save()
        res.send(existingDepartment)
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})


router.delete('/settings/department/delete', auth, async (req, res) => {

    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }

        const deptId = req.query.deptId
        if (!deptId) {
            throw new Error('Department is missing')
        }

        const ExitingDepartment = await Department.findOne({ _id : deptId })
       
        if (!ExitingDepartment) {
            throw new Error(`${ExitingDepartment.departmentName} not found`)
        }

        await Department.remove()
        res.send({ status: ` ${deptId} Department deleted successfully` })

    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})
module.exports = router