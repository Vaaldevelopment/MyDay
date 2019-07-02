const mongoose = require('mongoose');

const adminUser = {
    _id: new mongoose.Types.ObjectId(), 
    userName: 'admin',
    password: 'Vaal123',
    token: ''
}

module.exports = adminUser 