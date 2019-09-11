const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')
const Leave = require('../src/models/leave')

const userId = new mongoose.Types.ObjectId()
const user = {
    _id: userId,
    employeeCode: 'VT_001',
    firstName: 'firstName',
    lastName: 'Lastname',
    password: 'Pass123',
    email: 'pass@gmail.com',
    managerEmployeeCode: 'VT100',
    isHR: true,
    department: 'Marketing',
    employeeStatus: 'Permanent',
    dateOfJoining: '2020-06-27T06:17:07.654Z',
    EL: 20,
    CL: 5,
    tokens: [{
        token: jwt.sign({ _id: userId }, process.env.JWT_SECRETKEY)
    }]
}

const leaveApplication = {
    employeeCode: user.employeeCode,
    reason: "Travelling",
    fromDate: "2019-12-11",
    toDate: "2019-12-13",
    leaveType: "CL",
    leavePlanned: true
}

const leaveApplication1 = {
    employeeCode: user.employeeCode,
    reason: "Travelling",
    fromDate: "2019-11-01",
    toDate: "2019-11-02",
    leaveType: "CL",
    leavePlanned: true
}


const leaveApplication2 = {
    employeeCode: user.employeeCode,
    reason: "Sick",
    fromDate: "2019-11-10",
    toDate: "2019-11-15",
    leaveType: "CL",
    leavePlanned: true
}


const leaveApplication3 = {
    employeeCode: user.employeeCode,
    reason: "PTO",
    fromDate: "2019-12-20",
    toDate: "2019-12-31",
    leaveType: "CL",
    leavePlanned: false
}


beforeEach(async () => {
    await User.deleteMany()
    await Leave.deleteMany()
    await new User(user).save()
    await new Leave(leaveApplication1).save()
    await new Leave(leaveApplication2).save()
    await new Leave(leaveApplication3).save()
})



test('User leave list', async () => {

    const logUser = await User.findById(userId)
    const response = await request(app).get('/user/leave/list')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send()
        .expect(201)
    const responseLeave1 = response.body.leaveList[0]
    expect(new Date(responseLeave1.fromDate)).toEqual(new Date(leaveApplication1.fromDate))
    expect(new Date(responseLeave1.toDate)).toEqual(new Date(leaveApplication1.toDate))
    expect(responseLeave1.reason).toEqual(leaveApplication1.reason)

    const responseLeave2 = response.body.leaveList[1]
    expect(new Date(responseLeave2.fromDate)).toEqual(new Date(leaveApplication2.fromDate))
    expect(new Date(responseLeave2.toDate)).toEqual(new Date(leaveApplication2.toDate))
    expect(responseLeave2.reason).toEqual(leaveApplication2.reason)
})


test('User apply for leave', async () => {

    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplication)
        .expect(201)

    expect(response.body.Data.reason).toEqual(leaveApplication.reason)
    expect(new Date(response.body.Data.fromDate)).toEqual(new Date(leaveApplication.fromDate))
    expect(new Date(response.body.Data.toDate)).toEqual(new Date(leaveApplication.toDate))

    const leave = await Leave.findOne({ employeeCode: logUser.employeeCode, fromDate: leaveApplication.fromDate, toDate: leaveApplication.toDate })//Todo - Add from, to,reason
    expect(leave).not.toBeNull()
})

test('User apply for leave if from date and to date is weeekday', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromToWeekday = {
        _id: leaveId,
        employeeCode: user.employeeCode,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: '2019-10-04',
        toDate: '2019-10-04',
        leaveStatus: 'Pending',
        leavePlanned: true
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromToWeekday)
        .expect(201)

    expect(response.body.Data.reason).toEqual(fromToWeekday.reason)
    expect(new Date(response.body.Data.fromDate)).toEqual(new Date(fromToWeekday.fromDate))
    expect(new Date(response.body.Data.toDate)).toEqual(new Date(fromToWeekday.toDate))
    const leave = await Leave.findOne({ employeeCode: logUser.employeeCode, fromDate: fromToWeekday.fromDate, toDate: fromToWeekday.toDate })//Todo - Add from, to,reason
    expect(leave).not.toBeNull()
})


test('User apply for leave if from date and to date span not including weekend', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromToInWeekend = {
        _id: leaveId,
        employeeCode: user.employeeCode,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: '2019-10-22',
        toDate: '2019-10-29',
        leaveStatus: 'Pending',
        leavePlanned: true
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromToInWeekend)
        .expect(201)

    expect(response.body.Data.reason).toEqual(fromToInWeekend.reason)
    expect(new Date(response.body.Data.fromDate)).toEqual(new Date(fromToInWeekend.fromDate))
    expect(new Date(response.body.Data.toDate)).toEqual(new Date(fromToInWeekend.toDate))
    const leave = await Leave.findOne({ employeeCode: logUser.employeeCode, fromDate: fromToInWeekend.fromDate, toDate: fromToInWeekend.toDate })//Todo - Add from, to,reason
    expect(leave).not.toBeNull()
})

test('User apply for leave if from date and to date span including weekend', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromToWeekdays = {
        _id: leaveId,
        employeeCode: user.employeeCode,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: '2019-10-07',
        toDate: '2019-10-11',
        leaveStatus: 'Pending',
        leavePlanned: true
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromToWeekdays)
        .expect(201)
    expect(response.body.Data.reason).toEqual(fromToWeekdays.reason)
    expect(new Date(response.body.Data.fromDate)).toEqual(new Date(fromToWeekdays.fromDate))
    expect(new Date(response.body.Data.toDate)).toEqual(new Date(fromToWeekdays.toDate))
    const leave = await Leave.findOne({ employeeCode: logUser.employeeCode, fromDate: fromToWeekdays.fromDate, toDate: fromToWeekdays.toDate })//Todo - Add from, to,reason
    expect(leave).not.toBeNull()
})

test('User apply for leave if from date and to date span including holiday', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromToInHoliday = {
        _id: leaveId,
        employeeCode: user.employeeCode,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: '2019-10-01',
        toDate: '2019-10-03',
        leaveStatus: 'Pending',
        leavePlanned: true
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromToInHoliday)
        .expect(201)
    expect(response.body.Data.reason).toEqual(fromToInHoliday.reason)
    expect(new Date(response.body.Data.fromDate)).toEqual(new Date(fromToInHoliday.fromDate))
    expect(new Date(response.body.Data.toDate)).toEqual(new Date(fromToInHoliday.toDate))
    const leave = await Leave.findOne({ employeeCode: logUser.employeeCode, fromDate: fromToInHoliday.fromDate, toDate: fromToInHoliday.toDate })//Todo - Add from, to,reason
    expect(leave).not.toBeNull()
})

test('User apply for leave if from date and to date span including holiday, weekend and span more than 7 working days (sandwich)', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromToInHolidayWeekend = {
        _id: leaveId,
        employeeCode: user.employeeCode,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: '2019-10-18',
        toDate: '2019-10-31',
        leaveStatus: 'Pending',
        leavePlanned: true
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromToInHolidayWeekend)
        .expect(201)

    expect(response.body.Data.reason).toEqual(fromToInHolidayWeekend.reason)
    expect(new Date(response.body.Data.fromDate)).toEqual(new Date(fromToInHolidayWeekend.fromDate))
    expect(new Date(response.body.Data.toDate)).toEqual(new Date(fromToInHolidayWeekend.toDate))
    const leave = await Leave.findOne({ employeeCode: logUser.employeeCode, fromDate: fromToInHolidayWeekend.fromDate, toDate: fromToInHolidayWeekend.toDate })//Todo - Add from, to,reason
    expect(leave).not.toBeNull()
})

test('Should not apply to leave if from date is holiday', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromDateholiday = {
        _id: leaveId,
        employeeCode: user.employeeCode,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: '2019-10-02',
        toDate: '2019-10-05',
        leaveStatus: 'Pending',
        leavePlanned: true
    }

    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromDateholiday)
        .expect(400)
    const leave = await Leave.findOne({ employeeCode: logUser.employeeCode, fromDate: fromDateholiday.fromDate, toDate: fromDateholiday.toDate })//Todo - Add from, to,reason
    expect(leave).toBeNull()
})

test('Should not apply to leave if to date is holiday', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const toDateholiday = {
        _id: leaveId,
        employeeCode: user.employeeCode,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: '2019-10-27',
        toDate: '2019-10-28',
        leaveStatus: 'Pending',
        leavePlanned: true
    }

    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(toDateholiday)
        .expect(400)
    const leave = await Leave.findOne({ employeeCode: logUser.employeeCode, fromDate: toDateholiday.fromDate, toDate: toDateholiday.toDate })//Todo - Add from, to,reason
    expect(leave).toBeNull()
})

test('Should not apply to leave if from date is weekend', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromDateWeekend = {
        _id: leaveId,
        employeeCode: user.employeeCode,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: '2019-10-05',
        toDate: '2019-10-06',
        leaveStatus: 'Pending',
        leavePlanned: true
    }

    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromDateWeekend)
        .expect(400)
    const leave = await Leave.findOne({ employeeCode: logUser.employeeCode, fromDate: fromDateWeekend.fromDate, toDate: fromDateWeekend.toDate })//Todo - Add from, to,reason
    expect(leave).toBeNull()
})

test('Should not apply to leave if to date is weekend', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const toDateWeekend = {
        _id: leaveId,
        employeeCode: user.employeeCode,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: '2019-10-11',
        toDate: '2019-10-13',
        leaveStatus: 'Pending',
        leavePlanned: true
    }

    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(toDateWeekend)
        .expect(400)
    const leave = await Leave.findOne({ employeeCode: logUser.employeeCode, fromDate: toDateWeekend.fromDate, toDate: toDateWeekend.toDate })//Todo - Add from, to,reason
    expect(leave).toBeNull()
})


test('Should not apply for leave if fromdate is invalid', async () => {
    const NewLeaveApplication = {
        employeeCode: user.employeeCode,
        reason: "Travelling",
        leaveType: "EL",
        fromDate: "2019-17-11",
        toDate: "2019-07-13"
    }
    const response = await request(app)
        .post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(NewLeaveApplication)
        .expect(400)

})

test('Should not apply for leave if todate is invalid', async () => {
    const NewLeaveApplication = {
        employeeCode: user.employeeCode,
        reason: "Travelling",
        leaveType: "EL",
        fromDate: "2019-07-21",
        toDate: "2019-07-13"
    }
    const response = await request(app)
        .post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(NewLeaveApplication)
        .expect(400)

})

test('Should not apply for leave if leave reason in empty', async () => {
    const NewLeaveApplication = {
        employeeCode: user.employeeCode,
        reason: "",
        leaveType: "EL",
        fromDate: "2019-07-11",
        toDate: "2019-07-13"
    }
    const response = await request(app)
        .post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(NewLeaveApplication)
        .expect(400)
})

test('Should not apply for duplicate leave', async () => {
    await new Leave(leaveApplication).save()

    const duplicateLeaveApplication = {
        employeeCode: user.employeeCode,
        leaveType: "EL",
        fromDate: "2019-11-11",
        toDate: "2019-11-13",
        leaveType: "CL",
        leavePlanned: true
    }
    const response = await request(app)
        .post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(duplicateLeaveApplication)
        .expect(400)
})

test('Should not apply for leave if toDate is previous leaves fromDate ', async () => { //todate = leave.fromdate
    await new Leave(leaveApplication).save()

    const ToDateLeaveApplication = {
        employeeCode: user.employeeCode,
        leaveType: "EL",
        fromDate: "2019-11-09",
        toDate: "2019-11-11",
        leaveType: "CL",
        leavePlanned: true
    }
    const response = await request(app)
        .post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(ToDateLeaveApplication)
        .expect(400)
})

test('Should not apply for leave if toDate is in between previous leaves ', async () => {
    await new Leave(leaveApplication).save()

    const ToDateLeaveApplication = {
        employeeCode: user.employeeCode,
        leaveType: "EL",
        fromDate: "2019-11-09",
        toDate: "2019-11-10",
        leaveType: "CL",
        leavePlanned: true
    }
    const response = await request(app)
        .post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(ToDateLeaveApplication)
        .expect(400)
})

test('Should not apply for leave if toDate is previous leaves toDate', async () => { //todate = leave.todate
    await new Leave(leaveApplication).save()

    const ToDateLeaveApplication = {
        employeeCode: user.employeeCode,
        leaveType: "EL",
        fromDate: "2019-11-09",
        toDate: "2019-11-13",
        leaveType: "CL",
        leavePlanned: true
    }
    const response = await request(app)
        .post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(ToDateLeaveApplication)
        .expect(400)
})

test('Should not apply for leave if fromDate & toDate is in between previous leaves', async () => {
    await new Leave(leaveApplication).save()

    const ToDateLeaveApplication = {
        employeeCode: user.employeeCode,
        leaveType: "EL",
        fromDate: "2019-11-09",
        toDate: "2019-11-15",
        leaveType: "CL",
        leavePlanned: true
    }
    const response = await request(app)
        .post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(ToDateLeaveApplication)
        .expect(400)
})


test('Update User leave application', async () => {

    const leaveAppId = new mongoose.Types.ObjectId()
    const updateLeaveApplication = {
        _id: leaveAppId,
        employeeCode: user.employeeCode,
        reason: "Travelling",
        fromDate: "2019-11-11",
        toDate: "2019-11-13",
        leaveType: "CL",
        leavePlanned: true
    }
    await new Leave(updateLeaveApplication).save()

    const modifiedLeave = {
        id: leaveAppId,
        reason: "Travelling",
        leaveType: "CL",
        fromDate: "2019-12-09",
        toDate: "2019-12-12"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post(`/user/leave/update`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(modifiedLeave)
        .expect(201)
    const updatedLeave = await Leave.findOne({ employeeCode: logUser.employeeCode, fromDate: modifiedLeave.fromDate, toDate: modifiedLeave.toDate })//Todo - Add from, to,reason
    expect(updatedLeave).not.toBeNull()

})

test('Should not update if from date is missing', async () => {
    const leaveAppId = new mongoose.Types.ObjectId()
    const updateLeaveApplication = {
        _id: leaveAppId,
        employeeCode: user.employeeCode,
        reason: "Travelling",
        fromDate: "2019-11-11",
        toDate: "2019-11-13",
        leaveType: "CL",
        leavePlanned: true
    }
    await new Leave(updateLeaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: " ",
        toDate: "2019-08-12"
    }
    const response = await request(app).post(`/user/leave/update?id=`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(modifiedLeave)
        .expect(400)
})

test('Should not update if to date is missing', async () => {
    const leaveAppId = new mongoose.Types.ObjectId()
    const updateLeaveApplication = {
        _id: leaveAppId,
        employeeCode: user.employeeCode,
        reason: "Travelling",
        fromDate: "2019-11-11",
        toDate: "2019-11-13",
        leaveType: "CL",
        leavePlanned: true
    }
    await new Leave(updateLeaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: "2019-08-10",
        toDate: " "
    }
    const response = await request(app).post(`/user/leave/update?id=`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(modifiedLeave)
        .expect(400)
})

test('Should not update if query string is missing', async () => {
    const leaveAppId = new mongoose.Types.ObjectId()
    const updateLeaveApplication = {
        _id: leaveAppId,
        employeeCode: user.employeeCode,
        reason: "Travelling",
        fromDate: "2019-11-11",
        toDate: "2019-11-13",
        leaveType: "CL",
        leavePlanned: true
    }
    await new Leave(updateLeaveApplication).save()
    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: "2019-08-10",
        toDate: "2019-08-12"
    }
    const response = await request(app).post(`/user/leave/update?id=`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(modifiedLeave)
        .expect(400)
})

test('Should not update if query string is invalid', async () => {
    const leaveAppId = new mongoose.Types.ObjectId()
    const updateLeaveApplication = {
        _id: leaveAppId,
        employeeCode: user.employeeCode,
        reason: "Travelling",
        fromDate: "2019-11-11",
        toDate: "2019-11-13",
        leaveType: "CL",
        leavePlanned: true
    }
    await new Leave(updateLeaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: "2019-08-10",
        toDate: "2019-08-12"
    }
    const response = await request(app).post(`/user/leave/update?id=5d25ba6ab64f4642d83ef336`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(modifiedLeave)
        .expect(400)
})

test('Should not update if leave status is Approved/Rejected/Cancelled', async () => {
    const leaveAppId = new mongoose.Types.ObjectId()
    const updateLeaveApplication = {
        _id: leaveAppId,
        employeeCode: user.employeeCode,
        reason: "Travelling",
        fromDate: "2019-11-11",
        toDate: "2019-11-13",
        leaveType: "CL",
        leavePlanned: true
    }
    await new Leave(updateLeaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: "2019-08-10",
        toDate: "2019-08-12",
        leaveStatus: 'Approved'
    }
    const response = await request(app).post(`/user/leave/update?id=5d25ba6ab64f4642d83ef336`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(modifiedLeave)
        .expect(400)
})

test('Delete leave application', async () => {
    const leaveAppId = new mongoose.Types.ObjectId()
    const updateLeaveApplication = {
        _id: leaveAppId,
        employeeCode: user.employeeCode,
        reason: "Travelling",
        fromDate: "2019-11-11",
        toDate: "2019-11-13",
        leaveType: "CL",
        leavePlanned: true
    }
    await new Leave(updateLeaveApplication).save()

    const response = await request(app).delete(`/user/leave/delete?id=${leaveAppId}`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(200)
    const deleteLeaveApp = await Leave.findById(leaveAppId)
    expect(deleteLeaveApp).toBeNull()
})

test('Should not delete if query string missing', async () => {
    const leaveAppId = new mongoose.Types.ObjectId()
    const updateLeaveApplication = {
        _id: leaveAppId,
        employeeCode: user.employeeCode,
        reason: "Travelling",
        fromDate: "2019-11-11",
        toDate: "2019-11-13",
        leaveType: "CL",
        leavePlanned: true
    }
    await new Leave(updateLeaveApplication).save()

    const response = await request(app).delete(`/user/leave/delete`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(400)
    const deleteLeaveApp = await Leave.findById(leaveAppId)
    expect(deleteLeaveApp).not.toBeNull()
})

test('Should not delete if query string invalid', async () => {
    const leaveAppId = new mongoose.Types.ObjectId()
    const updateLeaveApplication = {
        _id: leaveAppId,
        employeeCode: user.employeeCode,
        reason: "Travelling",
        fromDate: "2019-11-11",
        toDate: "2019-11-13",
        leaveType: "CL",
        leavePlanned: true
    }
    await new Leave(updateLeaveApplication).save()

    const response = await request(app).delete(`/user/leave/delete?id=afsdfsdfsfsdf`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(400)
    const deleteLeaveApp = await Leave.findById(leaveAppId)
    expect(deleteLeaveApp).not.toBeNull()
})

test('Should not delete if query string invalid', async () => {
    const leaveAppId = new mongoose.Types.ObjectId()
    const updateLeaveApplication = {
        _id: leaveAppId,
        employeeCode: user.employeeCode,
        reason: "Travelling",
        fromDate: "2019-11-11",
        toDate: "2019-11-13",
        leaveType: "CL",
        leavePlanned: true
    }
    await new Leave(updateLeaveApplication).save()

    const response = await request(app).delete(`/user/leave/delete?id=afsdfsdfsfsdf`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(400)
    const deleteLeaveApp = await Leave.findById(leaveAppId)
    expect(deleteLeaveApp).not.toBeNull()
})

test('Should not delete if leave status is Apporved', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const approvedLeaveStatus = {
        _id: leaveId,
        employeeCode: user.employeeCode,
        reason: "Travelling",
        leaveType: "CL",
        fromDate: "2019-08-10",
        toDate: "2019-08-12",
        leaveStatus: 'Approved',
        leavePlanned: true
    }
    await new Leave(approvedLeaveStatus).save()
    const response = await request(app).delete(`/user/leave/delete?id=${leaveId}`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(400)
    const deleteLeaveApp = await Leave.findById(leaveId)
    expect(deleteLeaveApp).not.toBeNull()
})


