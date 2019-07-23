const mongoose = require('mongoose');
const validator = require('validator');
const Holiday = require('../models/holiday')

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
        required: true
    },
    leaveStatus: {
        type: String,
        default: 'Pending'
    },
}, {
        timestamps: true
    })



leaveSchema.statics.checkLeaveData = async (fromDate, toDate, reason, employeeCode) => {

    if (new Date(fromDate) < new Date() || new Date(toDate) < new Date() || toDate < fromDate) {
        throw new Error('Can not apply leave to past date')
    }

    var fromDay = new Date(fromDate).getDay()
    var toDay = new Date(toDate).getDay()
    if ((fromDay === 6) || (fromDay === 0) || (toDay === 6) || (toDay === 0)) {
        throw new Error(`Can not apply leave, selected date is weekend date`)
    }

    const checkFromDateHoliday = await Holiday.findOne({ date: fromDate })
    if (checkFromDateHoliday) {
        throw new Error(`Can not apply leave, From date ${checkFromDateHoliday.date} is holiday`)
    }

    const checktoDateHoliday = await Holiday.findOne({ date: toDate })
    if (checktoDateHoliday) {
        throw new Error(`Can not apply leave, To date ${checktoDateHoliday.date} is holiday`)
    }

    const leaveList = await Leave.find({ employeeCode: employeeCode })

    if (leaveList.length != 0) {

        let checkFromDate = new Date(fromDate).getTime();
        let checkToDate = new Date(toDate).getTime();

        //checking where mf < f and mt >= f

        let filterArray = leaveList.filter(m =>
            new Date(m.fromDate).getTime() < checkFromDate && new Date(m.toDate).getTime() >= checkFromDate)

        if (filterArray.length > 0) {
            throw new Error('Leave overlapping, Can not apply to leave.')
        }

        filterArray = leaveList.filter(m =>
            new Date(m.fromDate).getTime() >= checkFromDate && new Date(m.fromDate).getTime() <= checkToDate)

        if (filterArray.length > 0) {
            throw new Error('Leave overlapping, Can not apply to leave.')
        }
    }
    
}

const Leave = mongoose.model('Leave', leaveSchema)
module.exports = Leave