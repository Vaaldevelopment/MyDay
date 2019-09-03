const mongoose = require('mongoose');

const admin = {
    _id: new mongoose.Types.ObjectId(), 
    email: process.env.SUPER_ADMIN_USER,
    password: process.env.SUPER_ADMIN,
    token: ''
}

module.exports = admin 