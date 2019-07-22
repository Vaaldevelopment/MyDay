const mongoose = require('mongoose');

const admin = {
    _id: new mongoose.Types.ObjectId(), 
    userName: 'admin',
    password: 'Vaal123',
    token: ''
}

module.exports = admin 