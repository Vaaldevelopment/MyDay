const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

router.get('/manager/user/list', auth, async (req,res) => {
    const countManager = await User.countDocuments({managerEmployeeCode: req.user.employeeCode})
    if(countManager < 0){
        throw new Error ('User is not manager')
    }
    try {
        const managerEmpList = await User.find({ managerEmployeeCode: req.user.employeeCode })
        res.send(managerEmpList)
    }catch (e){
        res.status(400).send({ error: e.message })
    }
})

router.get('/manager/user/reclist', auth, async (req,res) => {
    const countManager = await User.countDocuments({managerEmployeeCode: req.user.employeeCode})
    if(countManager == 0){
        throw new Error ('User is not manager')
    }
    try {
    
        const descendants=[]
        const stack=[];
        const item = await User.findOne({ managerEmployeeCode: req.user.employeeCode })
        stack.push(item)
        
        while (stack.length>0){
            var currentnode = stack.pop()
            console.log(currentnode)
            var children = await User.find({managerEmployeeCode:{$in:currentnode.employeeCode}}  )
            
            while(true == children.hasNext()) {
                var child = children.next()
                descendants.push(child._id)
                stack.push(child);
            }
            console.log(descendants)
            console.log(stack)
        }

    }catch (e){
        res.status(400).send({ error: e.message })
    }
})

module.exports = router