const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./user')
const Holiday = require('../models/holiday')
const Notification = require('../models/notification')
const LeaveData = require('../models/leavedata')
const currentyear = new Date().getFullYear()

const compensationOffSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        trim: true
    },
    fromDateCO: {
        type: Date,
        required: true
    },
    toDateCO: {
        type: Date,
        required: true
    },
    reasonCO: {
        type: String,
        required: true,
        trim: true
    },
    managerNoteCO: {
        type: String,
        trim: true,
    },
    fromSpanCO: {
        type: String,
        required: true,
        trim: true
    },
    toSpanCO: {
        type: String,
        required: true,
        trim: true
    },
    statusCO: {
        type: String,
        required: true,
        trim: true
    },
    compOffSpan: {
        type: Number
    }
}, {
    timestamps: true
})

compensationOffSchema.statics.checkCompOffDates = async (reqData, userId) => {

    const compOffList = await CompensationOff.find({
        employeeId: userId,
        statusCO: { $in: ['Approved', 'Pending'] },
        $or: [{ "$expr": { "$eq": [{ "$year": "$fromDateCO" }, currentyear] } }, { "$expr": { "$eq": [{ "$year": "$toDateCO" }, currentyear] } }]
    })
    let checkFromDate = new Date(reqData.fromDateCO)
    let checkToDate = new Date(reqData.toDateCO)

    let filterArray = compOffList.filter(m =>
        new Date(m.fromDateCO).getTime() <= checkFromDate && new Date(m.toDateCO).getTime() >= checkFromDate)
    if (filterArray.length > 0) {
        throw new Error('Already applied for this date')
    }

    filterArray = compOffList.filter(m =>
        new Date(m.fromDateCO).getTime() >= checkFromDate && new Date(m.fromDateCO).getTime() <= checkToDate)
    if (filterArray.length > 0) {
        throw new Error('Already applied for this date')
    }
}

compensationOffSchema.statics.applyCompOff = async (reqData, userId) => {
    await CompensationOff.checkCompOffDates(reqData, userId)
    const compOff = new CompensationOff(reqData)
    compOff.employeeId = userId
    compOff.statusCO = 'Pending'
    const userData = await User.findOne({ _id: userId })
    // compOff.save()
    var compOffspan = await CompensationOff.calCompOffSpan(reqData.fromDateCO, reqData.toDateCO, reqData.calLeaveFromSpanCO, reqData.calLeaveToSpanCO)
    await compOff.save(function (err, addedCompOff) {
        if (err) throw err;
        const notification = new Notification()
        notification.leaveId = addedCompOff._id
        notification.fromId = userId
        notification.toId = userData.managerEmployeeCode
        notification.notificationStatus = 'Applied for Comp Off'
        notification.save()
    });

    var compOffYear = new Date(reqData.fromDateCO).getFullYear()
    const getLeaveData = await LeaveData.findOne({ employeeId: userId, year: compOffYear })
    getLeaveData.compOffLeave = getLeaveData.compOffLeave + compOffspan
    getLeaveData.save()

    return compOff
}

compensationOffSchema.statics.calCompOffSpan = async (fromDate, toDate, calLeaveFromSpan, calLeaveToSpan) => {
    var halfDay = ['FIRST HALF', 'SECOND HALF']
    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    var fromDate = new Date(fromDate);
    var toDate = new Date(toDate);
    let nLeaveDays = 1 + Math.round(Math.abs((fromDate.getTime() - toDate.getTime()) / (oneDay)));

    // let nsaturdays = Math.floor((fromDate.getDay() + nLeaveDays) / 7);
    // let nWeekends = 2 * nsaturdays + (fromDate.getDay() == 0) - (toDate.getDay() == 6);
    // //const holidayList = await Holiday.find({ date: { $gte: new Date() } })
    // const holidayList = await Holiday.find()

    // let filterHolidayArray = holidayList.filter(h =>
    //     new Date(h.date).getTime() > fromDate.getTime() && new Date(h.date).getTime() < toDate.getTime())
    // let nHolidays = filterHolidayArray.length

    // let leaveSpan = nLeaveDays - nWeekends - nHolidays
    let leaveSpan = nLeaveDays
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

    // if (leaveSpan > 7) { //Sandwich Leave

    //     leaveSpan = leaveSpan + nWeekends
    // }
    return leaveSpan
}

// compensationOffSchema.statics.checkLaps = async (empId, year) => {

//     var lastSixtyfromDate = new Date();
//     lastSixtyfromDate.setDate(lastSixtyfromDate.getDate() - 60);
//     console.log('lastSixtyfromDate' + lastSixtyfromDate)

//     const checkCompOfflaps = await CompensationOff.find({
//         employeeId: empId, statusCO: { $in: ['Pending'] }, fromDateCO:  {$eq: new Date(lastSixtyfromDate)}
//     })
//     console.log(checkCompOfflaps)
//     // const filterCompOff = checkCompOfflaps.filter(co => new Date(co.fromDateCO) == new Date(co.fromDateCO.setDate(co.fromDateCO.getDate() + 60)))
//     // var date = new Date('2019-12-26T00:00:00.000Z')
//     // date.setDate(date.getDate() + 60);
//     // console.log('date' + date)
//     // console.log('filterCompOff' + filterCompOff)
//     // console.log(checkCompOfflaps.length)
//     // for(let i=0; i < checkCompOfflaps.length; i++){
//     //     var nextSixtyfromDate = new Date();
//     //     nextSixtyfromDate.setDate(nextSixtyfromDate.getDate() + 60);
//     //     console.log(checkCompOfflaps[i].fromDateCo)
//     //     console.log(new Date(nextSixtyfromDate))
//     //     if(new Date(checkCompOfflaps[i].fromDateCo) == new Date(nextSixtyfromDate)){
//     //         console.log('kahsdggdildfg')
//     //         checkCompOfflaps[i].statusCO = 'Laps'
//     //         await checkCompOfflaps[i].save()
//     //     }
//     //}
// }

const CompensationOff = mongoose.model('CompensationOff', compensationOffSchema)
module.exports = CompensationOff