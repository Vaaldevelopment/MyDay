const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const Leave = require('../models/leave')
const EmailData = require('../models/emaildata')
const currentyear = new Date().getFullYear()

router.post('/send/email', auth, async (req, res) => {
    try {
        const empData = await User.find()
        var empDetails = empData.filter(e => e._id == req.body.employeeId)
        var empManager = empData.filter(m => m._id == empDetails[0].managerEmployeeCode)
        var formatFromDate = formateDate(req.body.fromDate);
        var formatToDate = formateDate(req.body.toDate);
        var monthOfLeave = formatFromDate.split(" ");
        var subjectdata = req.body.leaveStatus;
        if(subjectdata == 'Pending'){
            subjectdata = 'Applied';
        }
        var emailSubject = empDetails[0].firstName + ' ' + empDetails[0].lastName + ' | Leave '+ subjectdata +' (VESS) ';

        const calLeaveSpanArray = await Leave.checkLeaveBalance(req.body.fromDate, req.body.toDate, req.body._id, req.body.fromSpan, req.body.toSpan)
        var leaveCount = calLeaveSpanArray[0]

        var htmlContent = '<p>Hi,</p><p>Employee Leave Information: </p><table border="1" cellpadding="15" cellspacing="0"><tbody><tr><td><b>Name</b></td><td><b>From</b></td><td><b>To</b></td><td><b>Leave Span</b></td><td><b>Reason</b></td><td><b>Leave Status</b></td><td><b>Action</b></td></tr></tbody>';
        htmlContent += '<tr><td>' + empDetails[0].firstName + ' ' + empDetails[0].lastName + '</td><td>' + formatFromDate + ' - ' + req.body.fromSpan + '</td><td>' + formatToDate + ' - ' + req.body.toSpan + '</td><td>' + leaveCount + '</td><td>' + req.body.reason + '</td><td>' + req.body.leaveStatus + '</td><td><a href="https://vaalleaveapplication.herokuapp.com/">Click Here</a></td></tr>'
        htmlContent += '</table><br><small>This message was sent on behalf of <a href="https://vaalleaveapplication.herokuapp.com/">VESS</a>.  Please do not reply to this automated email.</small>';
        const triggerEmail = await EmailData.sentEmail(emailSubject, htmlContent, empDetails[0], empManager[0], req.body)

        res.status(200).send({ 'sentRes': triggerEmail })
    } catch (e) {
        res.status(401).send(e.message)
    }
})

router.post('/send/manager/email', auth, async (req, res) => {
    try {
        const empData = await User.find()
        var empDetails = empData.filter(e => e._id == req.body.employeeId)
        var empManager = empData.filter(m => m._id == req.user._id.toString())
        var formatFromDate = formateDate(req.body.fromDate);
        var formatToDate = formateDate(req.body.toDate);
        var monthOfLeave = formatFromDate.split(" ");
        var emailSubject = empManager[0].firstName + ' ' + empManager[0].lastName + '| Leave ' + req.body.leaveStatus + ' (VESS) ';

        const calLeaveSpanArray = await Leave.checkLeaveBalance(req.body.fromDate, req.body.toDate, req.body._id, req.body.fromSpan, req.body.toSpan)
        var leaveCount = calLeaveSpanArray[0]

        var managerComment = req.body.managerNote;
        if(managerComment == undefined || !managerComment){
            managerComment = '';
        }
        var htmlContent = '<p>Hi,</p><p>Employee Leave Information: </p><table border="1" cellpadding="15" cellspacing="0"><tbody><tr><td><b>Name</b></td><td><b>From</b></td><td><b>To</b></td><td><b>Leave Span</b></td><td><b>Reason</b></td><td><b>Leave Status</b></td><td><b>Comment</b></td></tr></tbody>';
        htmlContent += '<tr><td>' + empDetails[0].firstName + ' ' + empDetails[0].lastName + '</td><td>' + formatFromDate + ' - ' + req.body.fromSpan + '</td><td>' + formatToDate + ' - ' + req.body.toSpan + '</td><td>' + leaveCount + '</td><td>' + req.body.reason + '</td><td>' + req.body.leaveStatus + '</td><td>' + managerComment + '</td></tr>'
        htmlContent += '</table><br><small>This message was sent on behalf of <a href="https://vaalleaveapplication.herokuapp.com/">VESS</a>.  Please do not reply to this automated email.</small>';
        const triggerEmail = await EmailData.sentEmail(emailSubject, htmlContent, empDetails[0], empManager[0], req.body, req.user._id)

        res.status(200).send({ 'sentRes': triggerEmail })
    } catch (e) {
        res.status(401).send(e.message)
    }
})


function formateDate(date) {
    // console.log('date ' + date)
    // const monthNames = ["January", "February", "March", "April", "May", "June",
    //     "July", "August", "September", "October", "November", "December"];
    // const weekDaysNames = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
    let dateObj = new Date(date);
    // let month = monthNames[dateObj.getMonth()];
    let month = String(dateObj.getMonth()).padStart(2, '0');
    let day = String(dateObj.getDate()).padStart(2, '0');
    let year = dateObj.getFullYear();
    //let weekDays = weekDaysNames[dateObj.getDay()];
    //let output = weekDays + ' ' + month + ' ' + day + ', ' + year;
    let output = day + '-' + month + '-' + year;
    // console.log('output ' + output)
    return output;
}
module.exports = router