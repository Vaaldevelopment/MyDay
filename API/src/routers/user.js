const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
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
        res.send({ user, token})

    } catch (e) {
        res.status(401).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e.message)
    }
})


//call only admin
router.post('/users/logoutall', auth, async (req, res) => {

    try {
        console.log('logoutall')
        req.user.tokens = []
        console.log(req.user.tokens)
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e.message)
    }

    // try {
    //     const allusers= await User.find();
    //     for(let i = 0;i<allusers.length;i++)
    //     {
    //         let user = allusers[i];
    //         user.tokens = [];
    //         await user.save();
    //     }
 
        
    //     res.send()
    // } catch (e) {
    //     res.status(500).send
    // }
})

router.get('/users/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user)
        res.send(user)
    } catch (e) {
        res.status(500).send
    }

})


module.exports = router