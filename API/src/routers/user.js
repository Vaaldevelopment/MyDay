const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const router = new express.Router()


router.post('/users/createuser', auth, async (req, res) => {
    try {
        if (!req.user.isHR) {
            throw new Error('User is not HR')
        }

        const newUser = new User(req.body)
        await newUser.save()
        res.status(201).send({'user' : newUser })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })

    } catch (e) {
        res.status(401).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        //console.log(req)
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutall', auth, async (req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send
    }
})

router.get('/users/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user)
        res.send(user)
    } catch (e) {
        res.status(500).send
    }

})


// router.patch('/users/:id', async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' })
//     }
//     try {
//         //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
//         updates.forEach((update) => user[update] = req.body[update])
//         await user.save()
//         if (!user) {
//             return res.status(404).send()
//         }
//         res.send(user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })


module.exports = router