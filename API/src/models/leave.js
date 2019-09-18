const mongoose = require('mongoose');
const validator = require('validator');
const Holiday = require('../models/holiday')
const User = require('../models/user')
const currentyear = new Date().getFullYear()

const leaveSchema = new mongoose.Schema({
    employeeId: {
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
        trim: true,
    },
    leaveCount: {
        type: Number
    },
    fromSpan: {
        type: String,
    },
    toSpan: {
        type: String,
    }
}, {
    timestamps: true
})

// leaveSchema.methods.toJSON = async function () {
//     const leave = this
    
//     const leaveObject = leave.toObject()    
//     const leaveSpanArray = await Leave.checkLeaveBalance(leaveObject.fromDate, leaveObject.toDate, leaveObject.employeeCode)
//     leaveObject.leaveCount = leaveSpanArray[0]
//     console.log(leaveObject)
//     // leaveObject.leaveCount.then(function(result) {
//     //     leaveObject.leaveCount =(result[0]) // "Some User token"
//     //  })

//      return leaveObject
// }

leaveSchema.statics.checkLeaveData = async (fromDate, toDate, reason, employeeId) => {

    // if (new Date(fromDate) < new Date() || new Date(toDate) < new Date() || toDate < fromDate) {
    //     throw new Error('Can not apply leave to past date')
    // }

    if (new Date(toDate) < new Date(fromDate)) {
        throw new Error('To date is past date');
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

    // ToDO - What about leave from 25 Dec to 5 Jan
    const leaveList = await Leave.find({
        employeeId: employeeId,
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

leaveSchema.statics.calAllTakenLeave = async (employeeId) => {

    let leaveConsume = await Leave.find({
        employeeId: employeeId, leaveStatus: { $in: ['Approved', 'Taken'] },
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

leaveSchema.statics.checkLeaveBalance = async (fromDate, toDate, employeeId) => {
    
    let totalLeaveSpan = await Leave.calLeaveSpan(fromDate, toDate)
    
    let totalApprovedLeaves = await Leave.calAllTakenLeave(employeeId)
    let userLeaves = await User.find({ _id : employeeId })
    let totalUserLeaves = userLeaves.EL + userLeaves.CL 
    // + userLeaves.ML
    let balanceLeave = totalUserLeaves - totalApprovedLeaves
    if (balanceLeave < totalLeaveSpan) {
        throw new Error(`Leaves balance are not sufficient`)
    }
    const strarray = [totalLeaveSpan , balanceLeave];
    
    return strarray;
}


leaveSchema.statics.calculateLeaveBalance = async (employeeCode) => {
    let appliedLeaves = await Leave.find({
        employeeId: employeeCode, leaveStatus: { $in: ['Approved', 'Pending', 'Taken'] },
        $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, currentyear] } }]
    })

    const totalCL = appliedLeaves.filter(casualLeave => casualLeave.leaveType === 'CL')
    const totalEL = appliedLeaves.filter(earnedLeave => earnedLeave.leaveType === 'EL')

    let totalLeave = 0;
    let totalCalCL=0;
    let totalCalEL=0;

    for (let i = 0; i < appliedLeaves.length; i++) {
        let data = appliedLeaves[i];
        totalLeave += await Leave.calLeaveSpan(data.fromDate, data.toDate);
    }
    for (let i = 0; i < totalCL.length; i++) {
        let data1 = totalCL[i];
        totalCalCL += await Leave.calLeaveSpan(data1.fromDate, data1.toDate);
    }
    for (let i = 0; i < totalEL.length; i++) {
        let data2 = totalEL[i];
        totalCalEL += await Leave.calLeaveSpan(data2.fromDate, data2.toDate);
    }

    let userLeavesData = await User.findOne({ _id: employeeCode })
    let UserTotalLeaves = userLeavesData.EL + userLeavesData.CL
    totalLeaveBalance = UserTotalLeaves - totalLeave
    return calLeaveBalance = [totalLeaveBalance, totalCalCL, totalCalEL]

}
const Leave = mongoose.model('Leave', leaveSchema)
module.exports = Leave