const mongoose = require('mongoose');
const validator = require('validator');
const Holiday = require('../models/holiday')
const User = require('../models/user')
const currentyear = new Date().getFullYear()

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
    managerNote: {
        type: String,
        trim: true
    },
    leaveCount: {
        type: Number
    },
    fromSpan:{
        type: String,
    },
    toSpan: {
        type: String,
    }
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

    //$or not aplicable 
    const checkFromDateHoliday = await Holiday.findOne({ date: fromDate })
    if (checkFromDateHoliday) {
        throw new Error(`Can not apply leave, From date ${checkFromDateHoliday.date} is holiday`)
    }

    const checktoDateHoliday = await Holiday.findOne({ date: toDate })
    if (checktoDateHoliday) {
        throw new Error(`Can not apply leave, To date ${checktoDateHoliday.date} is holiday`)
    }

    // ToDO - What about leave from 25 Dec to 5 Jan
    const leaveList = await Leave.find({
        employeeCode: employeeCode,
        $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, currentyear] } }]
    })

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

leaveSchema.statics.calAllTakenLeave = async (employeeCode) => {

    let leaveConsume = await Leave.find({
        employeeCode: employeeCode, leaveStatus: 'Approved',
        $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, currentyear] } }]
    })

    let totalBalance = 0;

    for (let i = 0; i < leaveConsume.length; i++) {
        let data = leaveConsume[i];
        totalBalance += await Leave.calLeaveSpan(data.fromDate, data.toDate);
    }
    return totalBalance;
}

leaveSchema.statics.calLeaveSpan = async (fromDate, toDate) => {
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var fromDate = new Date(fromDate);
    var toDate = new Date(toDate);
    let nLeaveDays = 1 + Math.round(Math.abs((fromDate.getTime() - toDate.getTime()) / (oneDay)));

    let nsaturdays = Math.floor((fromDate.getDay() + nLeaveDays) / 7);
    let nWeekends = 2 * nsaturdays + (fromDate.getDay() == 0) - (toDate.getDay() == 6);
    //const holidayList = await Holiday.find({ date: { $gte: new Date() } })
    const holidayList = await Holiday.find()

    let filterHolidayArray = holidayList.filter(h =>
        new Date(h.date).getTime() > fromDate.getTime() && new Date(h.date).getTime() < toDate.getTime())
    let nHolidays = filterHolidayArray.length

    let leaveSpan = nLeaveDays - nWeekends - nHolidays

    if (leaveSpan > 7) { //Sandwich Leave

        leaveSpan = leaveSpan + nWeekends
    }

    return leaveSpan
}

leaveSchema.statics.checkLeaveBalance = async (fromDate, toDate, employeeCode) => {

    let totalLeaveSpan = await Leave.calLeaveSpan(fromDate, toDate)
    let totalApprovedLeaves = await Leave.calAllTakenLeave(employeeCode)

    
    let userLeaves = await User.findOne({ employeeCode: employeeCode })
    let totalUserLeaves = userLeaves.EL + userLeaves.CL + userLeaves.ML
    let balanceLeave = totalUserLeaves - totalApprovedLeaves

    if (balanceLeave < totalLeaveSpan) {
        throw new Error(`Leaves balance are not sufficient`)
    }
    return totalLeaveSpan
}

const Leave = mongoose.model('Leave', leaveSchema)
module.exports = Leave