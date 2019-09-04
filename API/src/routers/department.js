const express = require('express')
const Department = require('../models/department')
const User = require('../models/user')
const auth = require('../middleware/auth')
const authorizeAdmin = require('../middleware/adminAuth')
const router = new express.Router()

// Check Duplicate

router.get('/settings/department/list', authorizeAdmin, async (req, res) => {
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }
        const departmentList = await Department.departmentList()
        res.status(201).send({ 'departmentList': departmentList })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/hr/settings/department/list', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }
        const departmentList = await Department.departmentList()
        res.status(201).send({ 'departmentList': departmentList })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/settings/department/add', authorizeAdmin, async (req, res) => {
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }
        const departmentName = req.body.departmentName
        const dept = await Department.findOne({ departmentName })
        if (dept) {
            throw new Error('Duplicate Department')
        }
        const department = new Department(req.body)
        await department.save()
        res.status(201).send({ 'department': department })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.patch('/settings/department/edit', authorizeAdmin, async (req, res) => {
    try {
        if (!process.env.ADMINTOKEN) {
            throw new Error('User is not Admin')
        }
        const deptId = req.body.deptId
        if (!deptId) {
            throw new Error('Department is missing')
        }
        const existingDepartment = await Department.findOne({ _id: deptId })

        if (!existingDepartment) {
            throw new Error(`${req.body.deptId} not found`)
        }

        const updates = Object.keys(req.body)
        // const allowedUpdates = ['departmentName']
        // const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        // if (!isValidOperation) {
        //     throw new Error('Invalid updates!')
        // }

        updates.forEach((update) => existingDepartment[update] = req.body[update])
        await existingDepartment.save()
        res.send(existingDepartment)
    } catch (e) {
        res.status(400).send({ error: e.message })
    }
})

// Delete not required in Department

// router.delete('/settings/department/delete', auth, async (req, res) => {

//     try {
//         if (!req.user.isHR) {
//             throw new Error('User is not HR')
//         }

//         const deptId = req.query.deptId
//         if (!deptId) {
//             throw new Error('Department is missing')
//         }

//         const ExitingDepartment = await Department.findOne({ _id : deptId })

//         if (!ExitingDepartment) {
//             throw new Error(`${ExitingDepartment.departmentName} not found`)
//         }

//         await Department.remove()
//         res.send({ status: ` ${deptId} Department deleted successfully` })

//     } catch (e) {
//         res.status(400).send({ error: e.message })
//     }
// })
// //Not need to check dupliacte seperately
// router.get('/settings/department/checkDuplicatedepartment', auth, async (req, res) => {
//     try {
//         if (!req.user.isHR) {
//             throw new Error('User is not HR')
//         }
//         const departmentName = req.query.departmentString
//         const dept = await Department.findOne({ departmentName })
//         if(dept){
//             throw new Error ('Duplicate Department')
//         } else {
//             res.status(200).send();
//         }
//     } catch (e) {
//         res.status(400).send(e.message)
//     }
// })

module.exports = router