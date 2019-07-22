const mongoose = require('mongoose');
const validator = require('validator');

const leaveSchema = new mongoose.Schema({
    employeeCode: {
        type: String,
        required: true,
        trim: true
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    leaveType: {
        type: String,
        required: true
    },
    leavePlanned: {
        type: Boolean,
        default: 0
    },
    leaveStatus: {
        type: String,
        default: 'Pending'
    },
}, {
        timestamps: true
    })

const Leave = mongoose.model('Leave', leaveSchema)
module.exports = Leave