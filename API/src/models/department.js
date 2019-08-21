const mongoose = require('mongoose');
const validator = require('validator');


const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        trim: true
    },
}, {
        timestamps: true
    })

    
const Department = mongoose.model('Department', departmentSchema)
module.exports = Department