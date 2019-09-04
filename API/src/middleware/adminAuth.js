const jwt = require('jsonwebtoken')
const Admin = require('../models/admin')

const adminAuth = async (req, res, next) => {
    try {
        //console.log('Admin token Value' + process.env.ADMINTOKEN)
        const token = req.header('Authorization').replace('Bearer ', '')
        if (token !== process.env.ADMINTOKEN) {
            throw new Error()
        }
        req.token = token
        next()
    } catch (e) {
        console.log(e.message);
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = adminAuth