const mongoose = require('mongoose');
const validator = require('validator');
const User = require('../models/user')
const currentyear = new Date().getFullYear()
const today = new Date()

const leaveData = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: String,
        required: true,
        trim: true
    },
    earnedLeave: {
        type: Number,
        required: true,
        trim: true
    },
    casualLeave: {
        type: Number,
        required: true,
        trim: true
    },
    maternityLeave: {
        type: Number,
        trim: true
    },
    maternityFlag: {
        type: Boolean,
        trim: true
    },
    carryForwardLeave: {
        type: Number,
        trim: true
    },
    carryForwardFlag: {
        type: Boolean,
        trim: true
    },
    compOffLeave: {
        type: Number,
        trim: true,
        default: 0
    }
}, {
    timestamps: true
})



const LeaveData = mongoose.model('LeaveData', leaveData)
module.exports = LeaveData