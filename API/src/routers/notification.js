const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Notification = require('../models/notification')
const User = require('../models/user')
const currentyear = new Date().getFullYear()

router.get('/user/notification', auth, async (req, res) => {
    try {
        const notificationList = await Notification.find({
            toId: req.user._id,
            isRead: false,
            $or: [{ "$expr": { "$eq": [{ "$year": "$createdAt" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$updatedAt" }, currentyear] } }]
        }).sort({ createdAt: -1 })

        // const notificationList = await Notification.aggregate([{ 
        //     $lookup: {
        //         from:"users",
        //         localField: "fromId",
        //         foreignField: "_id",
        //         as: "fromUserData"
        //     }
        // }]).exec(function(err, notifications){
        //     console.log(notifications)
        // })

        // const notificationCount = await Notification.countDocuments({isRead : false, toId: req.user._id})
        res.status(200).send({ 'notificationList': notificationList })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/user/setNotificationFlag', auth, async (req, res) => {
    try {
        const existingnotification = await Notification.findOne({ _id: req.body._id })

        if (!existingnotification) {
            throw new Error(`Not exist for ${req.body._id}`)
        }
        const fromUserdata = await User.findOne({ _id: req.body.fromId })
        existingnotification.isRead = true
        await existingnotification.save()
        res.status(201).send({ 'setNotificationFlagData': existingnotification, 'fromUserdata': fromUserdata })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/user/setAllNotificationFlag', auth, async (req, res) => {
    try {
        const allUserNotification = await Notification.find({ toId: req.user._id })

        if (!allUserNotification) {
            throw new Error(`Not exist for  ${req.user._id}`)
        }
        console.log(allUserNotification)
        //    const fromUserdata = await User.findOne({_id : req.body.fromId})
       await Notification.updateMany({toId: req.user._id}, {"$set":{isRead: true}});
       console.log('update many')
        res.status(201).send()
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/user/clearAllNotificationFlag', auth, async (req, res) => {
    try {
        const toUserNotification = await Notification.find({ toId: req.user._id })

        if (!toUserNotification) {
            throw new Error(`Notification not exist for  ${req.body.toId}`)
        }
        console.log(toUserNotification)
        //    const fromUserdata = await User.findOne({_id : req.body.fromId})
       await Notification.updateMany({toId: req.user._id}, {"$set":{isRead: true}});
       console.log('update many')
        res.status(201).send()
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/user/getNotificationFromUserData', auth, async (req, res) => {
    try {
        const userManagerData = await User.findOne({ _id: req.user.managerEmployeeCode })
        res.status(201).send({ 'userManagerData': userManagerData })
    } catch (e) {
        res.status(400).send(e.message)
    }
})
module.exports = router