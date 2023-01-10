const mongoose = require('mongoose');
const validator = require('validator');
const Holiday = require('../models/holiday')
const User = require('../models/user')
const LeaveData = require('../models/leavedata')
const CompensationOff = require('../models/compensationoff')
const currentyear = new Date().getFullYear()
const today = new Date()

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
        required: true,
        trim: true
    },
    leavePlanned: {
        type: Boolean,
        required: true
    },
    leaveStatus: {
        type: String,
        default: 'Pending',
        trim: true
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
        required: true,
        trim: true
    },
    toSpan: {
        type: String,
        required: true,
        trim: true
    },
    requestedBy: {
        type: String,
        trim: true
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

leaveSchema.statics.checkLeaveData = async (fromDate, toDate, reason, employeeId, fromSpan, toSpan) => {

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

    if (fromSpan && toSpan && (new Date(fromDate).getTime() == new Date(toDate).getTime())) {
        if (fromSpan !== toSpan) {
            throw new Error('Can not apply leave, leave span should be same for single date')
        }
    } else {
        if ((fromSpan == "FIRST HALF" && toSpan == "FULL DAY") || (fromSpan == "FIRST HALF" && toSpan == "FIRST HALF") || (fromSpan == "FIRST HALF" && toSpan == "SECOND HALF") || (fromSpan == "SECOND HALF" && toSpan == "SECOND HALF")) {
            throw new Error('Can not apply leave, leave can not be merged for selected span ')
        }
    }

    // ToDO - What about leave from 25 Dec to 5 Jan
    var fromDateYear = new Date(fromDate).getFullYear();
    var toDateYear = new Date(toDate).getFullYear();
    if (fromDateYear && toDateYear) {
        if (fromDateYear !== toDateYear) {
            throw new Error('Can not apply leave for different year, add seperate leave')
        }
    }

    const leaveList = await Leave.find({
        employeeId: employeeId, leaveStatus: { $in: ['Approved', 'Rejected Taken', 'Approved Taken', 'Pending', 'Rejected','Cancelled'] },
        $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, fromDateYear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, toDateYear] } }]
    })

    if (leaveList.length != 0) {
        let checkFromDate = new Date(fromDate).getTime();
        let checkToDate = new Date(toDate).getTime();

        //checking where mf < f and mt >= f
        let filterArray = leaveList.filter(m =>
            new Date(m.fromDate).getTime() <= checkFromDate && new Date(m.toDate).getTime() >= checkFromDate)
        if (filterArray.length > 0) {
            let checkOverlapCancelledFromDate = leaveList.filter(c => new Date(c.fromDate).getTime() <= checkFromDate && new Date(c.toDate).getTime() >= checkFromDate && c.leaveStatus == "Cancelled")
            if(checkOverlapCancelledFromDate){
                throw new Error('Already applied/cancelled leave for selected date, revise & update your leave data')
            }
            await Leave.checkHalfDaySpan(filterArray, fromSpan, checkFromDate)
        }

        filterArray = leaveList.filter(m =>
            new Date(m.fromDate).getTime() >= checkFromDate && new Date(m.fromDate).getTime() <= checkToDate)
        if (filterArray.length > 0) {
            let checkOverlapCancelledToDate = leaveList.filter(D => new Date(D.fromDate).getTime() <= checkFromDate && new Date(D.toDate).getTime() >= checkToDate && D.leaveStatus == "Cancelled")
            if(checkOverlapCancelledToDate){
                throw new Error('Leave already cancelled selected date leave, revise & update your leave data')
            }
            await Leave.checkHalfDaySpan(filterArray, toSpan, checkToDate)
        }

    }
}

leaveSchema.statics.checkHalfDaySpan = async (filterArray, span, checkDate) => {
    let flag = true;
    let overlapDay;
    let overlapDayFirstHalf;
    let overlapDaySecondHalf;
    overlapDay = filterArray.find(p => p.fromSpan == 'FIRST HALF' || p.fromSpan == 'SECOND HALF' || p.toSpan == 'FIRST HALF' || p.toSpan == 'SECOND HALF');
    if (!overlapDay) {
        throw new Error('Leave overlapping, Can not apply to leave.')
    }
    switch (span) {
        case 'FIRST HALF':
            overlapDayFirstHalf = filterArray.find(p => (new Date(p.fromDate).getTime() == checkDate && p.fromSpan == 'FIRST HALF')
                || (new Date(p.toDate).getTime() == checkDate && p.toSpan == 'FIRST HALF'));
            if (overlapDayFirstHalf)
                flag = false;
            break;

        case 'SECOND HALF':
            overlapDaySecondHalf = filterArray.find(p => (new Date(p.fromDate).getTime() == checkDate && p.fromSpan == 'SECOND HALF')
                || (new Date(p.toDate).getTime() == checkDate && p.toSpan == 'SECOND HALF'));
            if (overlapDaySecondHalf)
                flag = false;
            break;
        default:
            flag = false;
            break;
    }
    if (!flag) {
        throw new Error('Leave overlapping, You have already applied for half day')
    }
}

leaveSchema.statics.checkConnectingFromDates = async (formDate, employeeId) => {
    let ConnectingFromDatesLeaveFlag = false
    let previousDate
    const connectingFromDate = new Date(formDate)
    do {
        previousDate = connectingFromDate.setDate(connectingFromDate.getDate() - 1)
        let previousToDay = new Date(previousDate).getDay()
        if ((previousToDay === 6) || (previousToDay === 0)) {
            previousDate = connectingFromDate.setDate(connectingFromDate.getDate() - 2)
        }

        let checkconnectingFromDateHoliday = await Holiday.findOne({ date: previousDate })


        if (checkconnectingFromDateHoliday != null) {
            previousDate = connectingFromDate.setDate(connectingFromDate.getDate() - 2)
            ConnectingFromDatesLeaveFlag = true
        } else {
            ConnectingFromDatesLeaveFlag = false
        }

    } while (ConnectingFromDatesLeaveFlag)

    let connectingLeavefromDate = await Leave.findOne({
        employeeId: employeeId, toDate: previousDate, leaveStatus: { $in: ['Approved', 'Rejected Taken', 'Approved Taken', 'Pending', 'Rejected'] },
        $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, currentyear] } }]
    })
    if (connectingLeavefromDate) {
        const connectingFromDateLeaveSpan = await Leave.calLeaveSpan(connectingLeavefromDate.fromDate, connectingLeavefromDate.toDate, connectingLeavefromDate.fromSpan, connectingLeavefromDate.toSpan)
        return connectingFromDateLeaveSpan
    }
}

leaveSchema.statics.checkConnectingToDates = async (toDate, employeeId) => {
    let ConnectingToDatesLeaveFlag = false
    let nextDate
    const connectingToDate = new Date(toDate)
    do {
        nextDate = connectingToDate.setDate(connectingToDate.getDate() + 1)
        let nextToDay = new Date(nextDate).getDay()
        if ((nextToDay === 6) || (nextToDay === 0)) {
            nextDate = connectingToDate.setDate(connectingToDate.getDate() + 2)
        }

        let checkconnectingToDateHoliday = await Holiday.findOne({ date: nextDate })
        if (checkconnectingToDateHoliday) {
            nextDate = connectingToDate.setDate(connectingToDate.getDate() + 1)
            ConnectingToDatesLeaveFlag = true
        } else {
            ConnectingToDatesLeaveFlag = false
        }

    } while (ConnectingToDatesLeaveFlag)

    let connectingLeaveToDate = await Leave.findOne({
        employeeId: employeeId, fromDate: nextDate, leaveStatus: { $in: ['Approved', 'Rejected Taken', 'Approved Taken', 'Pending', 'Rejected'] },
        $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, currentyear] } }]
    })
    if (connectingLeaveToDate) {
        const connectingToDateLeaveSpan = await Leave.calLeaveSpan(connectingLeaveToDate.fromDate, connectingLeaveToDate.toDate, connectingLeaveToDate.fromSpan, connectingLeaveToDate.toSpan)
        return connectingToDateLeaveSpan
    }
}

leaveSchema.statics.calAllTakenLeave = async (employeeId) => {

    let leaveConsume = await Leave.find({
        employeeId: employeeId, leaveStatus: { $in: ['Approved', 'Approved Taken'] },
        $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, currentyear] } }]
    })

    let totalBalance = 0;

    for (let i = 0; i < leaveConsume.length; i++) {
        let data = leaveConsume[i];
        totalBalance += await Leave.calLeaveSpan(data.fromDate, data.toDate, data.fromSpan, data.toSpan);
    }
    return totalBalance;
}

leaveSchema.statics.calLeaveSpan = async (fromDate, toDate, calLeaveFromSpan, calLeaveToSpan) => {
    var halfDay = ['FIRST HALF', 'SECOND HALF']
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
    if (calLeaveFromSpan == 'FIRST HALF' || calLeaveFromSpan == 'SECOND HALF' || calLeaveToSpan == 'FIRST HALF' || calLeaveToSpan == 'SECOND HALF') {
        if (fromDate.getDay() == toDate.getDay() && calLeaveFromSpan == calLeaveToSpan) {
            leaveSpan = leaveSpan - 0.5
        } else if (fromDate.getDay() !== toDate.getDay() && calLeaveFromSpan == 'SECOND HALF' && calLeaveToSpan == 'FIRST HALF') {
            leaveSpan = leaveSpan - 1
        }
    }
    if (fromDate.getDay() !== toDate.getDay() && ((calLeaveFromSpan == 'FULL DAY' && calLeaveToSpan == 'FIRST HALF')
        || (calLeaveFromSpan == 'SECOND HALF' && calLeaveToSpan == 'FULL DAY'))) {
        leaveSpan = leaveSpan - 0.5
    }
    // delete fromDate
    // delete toDate
    // delete calLeaveFromSpan
    // delete calLeaveToSpan

    fromDate = null
    toDate = null
    calLeaveFromSpan = null
    calLeaveToSpan = null

    if (leaveSpan >= 7) { //Sandwich Leave

        leaveSpan = leaveSpan + nWeekends
    }
    return leaveSpan
}

leaveSchema.statics.checkLeaveBalance = async (checkFromDate, checkToDate, employeeId, checkFromSpan, checkToSpan, requestedBy) => {
    let previousConnectionDateLeaveSpan
    let nextConnectionDateLeaveSpan
    let totalConnectingLeave
    let totalLeaveSpan = await Leave.calLeaveSpan(checkFromDate, checkToDate, checkFromSpan, checkToSpan)
    
    if (checkFromDate) {
        previousConnectionDateLeaveSpan = await Leave.checkConnectingFromDates(checkFromDate, employeeId)
        if (previousConnectionDateLeaveSpan == undefined) {
            previousConnectionDateLeaveSpan = 0
        }
    }
    if (checkToDate) {
        nextConnectionDateLeaveSpan = await Leave.checkConnectingToDates(checkToDate, employeeId)
        if (nextConnectionDateLeaveSpan == undefined) {
            nextConnectionDateLeaveSpan = 0
        }
    }

    if (previousConnectionDateLeaveSpan != 0 || nextConnectionDateLeaveSpan != 0) {
        totalConnectingLeave = totalLeaveSpan + previousConnectionDateLeaveSpan + nextConnectionDateLeaveSpan
        if (totalConnectingLeave > 6 && !requestedBy) {
            if (checkFromSpan == 'FULL DAY') {
                throw new Error('Can not apply to leave, to apply revise immediate previous/next leave application')
            }
        }
    }
    checkFromSpan = null
    checkToSpan = null

    let totalApprovedLeaves = await Leave.calAllTakenLeave(employeeId)
    let userLeaves = await LeaveData.find({ employeeId: employeeId, year: currentyear })
    let totalUserLeaves = userLeaves.earnedLeave + userLeaves.casualLeave
    // + userLeaves.ML
    let balanceLeave = totalUserLeaves - totalApprovedLeaves
    if (balanceLeave < totalLeaveSpan) {
        throw new Error(`Leaves balance are not sufficient`)
    }

    const strarray = [totalLeaveSpan, balanceLeave];
  
    return strarray;
}


leaveSchema.statics.calculateLeaveBalance = async (employeeCode, year) => {
    // let appliedLeaves = await Leave.find({
    //     employeeId: employeeCode, leaveStatus: { $in: ['Approved', 'Pending', 'Taken'] },
    //     $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, currentyear] } }]
    // })
    if (!year || year == undefined) {
        year = currentyear
    }
    let appliedLeaves = await Leave.find({
        employeeId: employeeCode, leaveStatus: { $in: ['Approved', 'Approved Taken'] }, fromDate: { "$lte": [{ "$year": "$fromDate" }, today] },
        $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, year] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, year] } }]
    })

    let futureAppliedLeaves = await Leave.find({
        employeeId: employeeCode, leaveStatus: { $in: ['Approved', 'Pending'] }, fromDate: { "$gt": [{ "$year": "$fromDate" }, today] },
        $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, year] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, year] } }]
    })


    const totalCL = appliedLeaves.filter(casualLeave => casualLeave.leaveType === 'CL')
    const totalEL = appliedLeaves.filter(earnedLeave => earnedLeave.leaveType === 'EL')

    let totalLeave = 0;
    let totalCalCL = 0;
    let totalCalEL = 0;
    let totalFutureLeave = 0;

    for (let i = 0; i < appliedLeaves.length; i++) {
        let data = appliedLeaves[i];
        totalLeave += await Leave.calLeaveSpan(data.fromDate, data.toDate, data.fromSpan, data.toSpan);
    }
    for (let i = 0; i < totalCL.length; i++) {
        let data1 = totalCL[i];
        totalCalCL += await Leave.calLeaveSpan(data1.fromDate, data1.toDate, data1.fromSpan, data1.toSpan);
    }
    for (let i = 0; i < totalEL.length; i++) {
        let data2 = totalEL[i];
        totalCalEL += await Leave.calLeaveSpan(data2.fromDate, data2.toDate, data2.fromSpan, data2.toSpan);
    }
    for (let i = 0; i < futureAppliedLeaves.length; i++) {
        let data3 = futureAppliedLeaves[i];
        totalFutureLeave += await Leave.calLeaveSpan(data3.fromDate, data3.toDate, data3.fromSpan, data3.toSpan);
    }

    let userLeavesData = await LeaveData.findOne({ employeeId: employeeCode, year: year })
    let userCompoff = await CompensationOff.find({
        employeeId: employeeCode, statusCO: { $in: ['Approved'] },
        $or: [{ "$expr": { "$eq": [{ "$year": "$fromDateCO" }, year] } }, { "$expr": { "$eq": [{ "$year": "$toDateCO" }, year] } }]
    })
    let compOffLeave = userCompoff.length
    let UserTotalLeaves = userLeavesData.earnedLeave + userLeavesData.casualLeave + compOffLeave
    totalLeaveBalance = UserTotalLeaves - totalLeave
    return calLeaveBalance = [totalLeaveBalance, totalCalCL, totalCalEL, totalFutureLeave, userLeavesData, compOffLeave]
}

leaveSchema.statics.calculateLastYearLeaveBalance = async (employeeCode, year) => {

    if (!year) {
        throw new Error(`Year is missing`)
    }
    var lastYear = year - 1
    console.log('PrintData ' + lastYear)
    let appliedLeaves = await Leave.find({
        employeeId: employeeCode, leaveStatus: { $in: ['Approved', 'Approved Taken'] },
        $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, lastYear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, lastYear] } }]
    })

    let futureAppliedLeaves = await Leave.find({
        employeeId: employeeCode, leaveStatus: { $in: ['Approved', 'Pending'] },
        $or: [{ "$expr": { "$eq": [{ "$year": "$fromDate" }, lastYear] } }, { "$expr": { "$eq": [{ "$year": "$toDate" }, lastYear] } }]
    })


    const totalCL = appliedLeaves.filter(casualLeave => casualLeave.leaveType === 'CL')
    const totalEL = appliedLeaves.filter(earnedLeave => earnedLeave.leaveType === 'EL')

    let totalLeave = 0
    let totalCalCL = 0
    let totalCalEL = 0
    let totalFutureLeave = 0
    let totalLeaveBalance = 0
    let UserTotalLeaves = 0

    for (let i = 0; i < appliedLeaves.length; i++) {
        let data = appliedLeaves[i];
        totalLeave += await Leave.calLeaveSpan(data.fromDate, data.toDate, data.fromSpan, data.toSpan);
    }


    for (let i = 0; i < totalCL.length; i++) {
        let data1 = totalCL[i];
        totalCalCL += await Leave.calLeaveSpan(data1.fromDate, data1.toDate, data1.fromSpan, data1.toSpan);
    }
    for (let i = 0; i < totalEL.length; i++) {
        let data2 = totalEL[i];
        totalCalEL += await Leave.calLeaveSpan(data2.fromDate, data2.toDate, data2.fromSpan, data2.toSpan);
    }
    for (let i = 0; i < futureAppliedLeaves.length; i++) {
        let data3 = futureAppliedLeaves[i];
        totalFutureLeave += await Leave.calLeaveSpan(data3.fromDate, data3.toDate, data3.fromSpan, data3.toSpan);
    }

    let userLeavesData = await LeaveData.findOne({ employeeId: employeeCode, year: lastYear })
    if (userLeavesData !== null) {
        UserTotalLeaves = userLeavesData.earnedLeave + userLeavesData.casualLeave
    }
    totalLeaveBalance = UserTotalLeaves - totalLeave
    return calLeaveBalance = [totalLeaveBalance, totalCalCL, totalCalEL, totalFutureLeave, userLeavesData]

}

leaveSchema.statics.datesOfLeave = async (fromDate, toDate, leaveSpan) => {
    var dates = [];
    var from = new Date(fromDate);
    var to = new Date(toDate);
    dates[0] = from;
    var nextDate = new Date(fromDate);
    var j = 1;
    for (let i = 1; j < leaveSpan[0]; i++) {
        nextDate.setDate(nextDate.getDate() + 1);
        const checkFromDateHoliday = await Holiday.findOne({ date: nextDate })
        if (!checkFromDateHoliday) {
            if (leaveSpan[0] > 7) {
                dates[j] = new Date(nextDate);
                j++;
            } else {
                if (nextDate.getDay() != 6 && nextDate.getDay() != 0) {
                    dates[j] = new Date(nextDate);
                    j++;
                }
            }
        }
    }
    return dates;
}
const Leave = mongoose.model('Leave', leaveSchema)
module.exports = Leave