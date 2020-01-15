const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')
const Leave = require('../src/models/leave')
const today = new Date()
const currentYear = today.getFullYear()

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
    dateOfJoining: currentYear + '-06-27T06:17:07.654Z',
    tokens: [{
        token: jwt.sign({ _id: userId }, process.env.JWT_SECRETKEY)
    }]
}


const leaveApplication1 = {
    employeeId: userId,
    reason: "Travelling",
    fromDate: currentYear + "-11-02",
    toDate: currentYear + "-11-03",
    leaveType: "CL",
    leavePlanned: true,
    fromSpan: "FULL DAY",
    toSpan: "FULL DAY"
}


const leaveApplication2 = {
    employeeId: userId,
    reason: "Sick",
    fromDate: currentYear + "-11-10",
    toDate: currentYear + "-11-16",
    leaveType: "CL",
    leavePlanned: true,
    fromSpan: "FULL DAY",
    toSpan: "FULL DAY"
}


const leaveApplication3 = {
    employeeId: userId,
    reason: "PTO",
    fromDate: currentYear + "-12-21",
    toDate: currentYear + "-12-31",
    leaveType: "CL",
    leavePlanned: false,
    fromSpan: "FULL DAY",
    toSpan: "FULL DAY"
}

const leaveApplication = {
    employeeId: userId,
    reason: "Travelling",
    fromDate: currentYear + "-12-11",
    toDate: currentYear + "-12-14",
    leaveType: "CL",
    leavePlanned: true,
    fromSpan: "FULL DAY",
    toSpan: "FULL DAY"
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
        .expect(200)
    // const responseLeave1 = response.body.leaveList[0]
    // expect(new Date(responseLeave1.fromDate)).toEqual(new Date(leaveApplication1.fromDate))
    // expect(new Date(responseLeave1.toDate)).toEqual(new Date(leaveApplication1.toDate))
    // expect(responseLeave1.reason).toEqual(leaveApplication1.reason)

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

    const leave = await Leave.findOne({ employeeId: userId, fromDate: leaveApplication.fromDate, toDate: leaveApplication.toDate })//Todo - Add from, to,reason
    expect(leave).not.toBeNull()
})

test('User apply for leave if from date and to date is weeekday', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromToWeekday = {
        _id: leaveId,
        employeeId: userId,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: currentYear + '-10-05',
        toDate: currentYear + '-10-05',
        leaveStatus: 'Pending',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromToWeekday)
        .expect(201)

    expect(response.body.Data.reason).toEqual(fromToWeekday.reason)
    expect(new Date(response.body.Data.fromDate)).toEqual(new Date(fromToWeekday.fromDate))
    expect(new Date(response.body.Data.toDate)).toEqual(new Date(fromToWeekday.toDate))
    const leave = await Leave.findOne({ employeeId: userId, fromDate: fromToWeekday.fromDate, toDate: fromToWeekday.toDate })//Todo - Add from, to,reason
    expect(leave).not.toBeNull()
})


test('User apply for leave if from date and to date span not including weekend', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromToInWeekend = {
        _id: leaveId,
        employeeId: userId,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: currentYear + '-10-19',
        toDate: currentYear + '-10-26',
        leaveStatus: 'Pending',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromToInWeekend)
        .expect(201)

    expect(response.body.Data.reason).toEqual(fromToInWeekend.reason)
    expect(new Date(response.body.Data.fromDate)).toEqual(new Date(fromToInWeekend.fromDate))
    expect(new Date(response.body.Data.toDate)).toEqual(new Date(fromToInWeekend.toDate))
    const leave = await Leave.findOne({ employeeId: userId, fromDate: fromToInWeekend.fromDate, toDate: fromToInWeekend.toDate })//Todo - Add from, to,reason
    expect(leave).not.toBeNull()
})

test('User apply for leave if from date and to date span including weekend', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromToWeekdays = {
        _id: leaveId,
        employeeId: userId,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: currentYear + '-10-07',
        toDate: currentYear + '-10-12',
        leaveStatus: 'Pending',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromToWeekdays)
        .expect(201)
    expect(response.body.Data.reason).toEqual(fromToWeekdays.reason)
    expect(new Date(response.body.Data.fromDate)).toEqual(new Date(fromToWeekdays.fromDate))
    expect(new Date(response.body.Data.toDate)).toEqual(new Date(fromToWeekdays.toDate))
    const leave = await Leave.findOne({ employeeId: userId, fromDate: fromToWeekdays.fromDate, toDate: fromToWeekdays.toDate })//Todo - Add from, to,reason
    expect(leave).not.toBeNull()
})

test('User apply for leave if from date and to date span including holiday', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromToInHoliday = {
        _id: leaveId,
        employeeId: userId,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: currentYear + '-10-01',
        toDate: currentYear + '-10-05',
        leaveStatus: 'Pending',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromToInHoliday)
        .expect(201)
    expect(response.body.Data.reason).toEqual(fromToInHoliday.reason)
    expect(new Date(response.body.Data.fromDate)).toEqual(new Date(fromToInHoliday.fromDate))
    expect(new Date(response.body.Data.toDate)).toEqual(new Date(fromToInHoliday.toDate))
    const leave = await Leave.findOne({ employeeId: userId, fromDate: fromToInHoliday.fromDate, toDate: fromToInHoliday.toDate })//Todo - Add from, to,reason
    expect(leave).not.toBeNull()
})

test('User apply for leave if from date and to date span including holiday, weekend and span more than 7 working days (sandwich)', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromToInHolidayWeekend = {
        _id: leaveId,
        employeeId: userId,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: currentYear + '-09-21',
        toDate: currentYear + '-09-30',
        leaveStatus: 'Pending',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromToInHolidayWeekend)
        .expect(201)

    expect(response.body.Data.reason).toEqual(fromToInHolidayWeekend.reason)
    expect(new Date(response.body.Data.fromDate)).toEqual(new Date(fromToInHolidayWeekend.fromDate))
    expect(new Date(response.body.Data.toDate)).toEqual(new Date(fromToInHolidayWeekend.toDate))
    const leave = await Leave.findOne({ employeeId: userId, fromDate: fromToInHolidayWeekend.fromDate, toDate: fromToInHolidayWeekend.toDate })//Todo - Add from, to,reason
    expect(leave).not.toBeNull()
})

test('Should not apply to leave if from date is holiday', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromDateholiday = {
        _id: leaveId,
        employeeId: userId,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: currentYear + '-10-02',
        toDate: currentYear + '-10-05',
        leaveStatus: 'Pending',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }

    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromDateholiday)
        .expect(400)
    const leave = await Leave.findOne({ employeeId: userId, fromDate: fromDateholiday.fromDate, toDate: fromDateholiday.toDate })//Todo - Add from, to,reason
    expect(leave).toBeNull()
})

test('Should not apply to leave if to date is holiday', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const toDateholiday = {
        _id: leaveId,
        employeeId: userId,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: currentYear + '-10-27',
        toDate: currentYear + '-10-28',
        leaveStatus: 'Pending',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }

    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(toDateholiday)
        .expect(400)
    const leave = await Leave.findOne({ employeeId: userId, fromDate: toDateholiday.fromDate, toDate: toDateholiday.toDate })//Todo - Add from, to,reason
    expect(leave).toBeNull()
})

test('Should not apply to leave if from date is weekend', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const fromDateWeekend = {
        _id: leaveId,
        employeeId: userId,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: currentYear + '-10-03',
        toDate: currentYear + '-10-04',
        leaveStatus: 'Pending',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }

    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(fromDateWeekend)
        .expect(400)
    const leave = await Leave.findOne({ employeeId: userId, fromDate: fromDateWeekend.fromDate, toDate: fromDateWeekend.toDate })//Todo - Add from, to,reason
    expect(leave).toBeNull()
})

test('Should not apply to leave if to date is weekend', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const toDateWeekend = {
        _id: leaveId,
        employeeId: userId,
        reason: 'PTO',
        leaveType: 'EL',
        fromDate: currentYear + '-10-11',
        toDate: currentYear + '-10-13',
        leaveStatus: 'Pending',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }

    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(toDateWeekend)
        .expect(400)
    const leave = await Leave.findOne({ employeeId: userId, fromDate: toDateWeekend.fromDate, toDate: toDateWeekend.toDate })//Todo - Add from, to,reason
    expect(leave).toBeNull()
})


test('Should not apply for leave if fromdate is invalid', async () => {
    const NewLeaveApplication = {
        employeeId: userId,
        reason: "Travelling",
        leaveType: "EL",
        fromDate: currentYear + "-17-11",
        toDate: currentYear + "-07-13",
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    const response = await request(app)
        .post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(NewLeaveApplication)
        .expect(400)

})

test('Should not apply for leave if todate is invalid', async () => {
    const NewLeaveApplication = {
        employeeId: userId,
        reason: "Travelling",
        leaveType: "EL",
        fromDate: currentYear + "-07-21",
        toDate: currentYear + "-07-13",
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    const response = await request(app)
        .post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(NewLeaveApplication)
        .expect(400)

})

test('Should not apply for leave if leave reason in empty', async () => {
    const NewLeaveApplication = {
        employeeId: userId,
        reason: "",
        leaveType: "EL",
        fromDate: currentYear + "-07-11",
        toDate: currentYear + "-07-13",
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        leaveType: "EL",
        fromDate: currentYear + "-11-11",
        toDate: currentYear + "-11-13",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        leaveType: "EL",
        fromDate: currentYear + "-11-09",
        toDate: currentYear + "-11-11",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        leaveType: "EL",
        fromDate: currentYear + "-11-09",
        toDate: currentYear + "-11-10",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        leaveType: "EL",
        fromDate: currentYear + "-11-09",
        toDate: currentYear + "-11-13",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        leaveType: "EL",
        fromDate: currentYear + "-11-09",
        toDate: currentYear + "-11-15",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-09-18",
        toDate: currentYear + "-09-21",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(updateLeaveApplication).save()

    const modifiedLeave = {
        id: leaveAppId,
        reason: "Travelling",
        leaveType: "CL",
        fromDate: currentYear + "-09-15",
        toDate: currentYear + "-09-18",
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post(`/user/leave/update`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(modifiedLeave)
        .expect(201)
    const updatedLeave = await Leave.findOne({ employeeId: userId, fromDate: modifiedLeave.fromDate, toDate: modifiedLeave.toDate })//Todo - Add from, to,reason
    expect(updatedLeave).not.toBeNull()

})

test('Should not update if from date is missing', async () => {
    const leaveAppId = new mongoose.Types.ObjectId()
    const updateLeaveApplication = {
        _id: leaveAppId,
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-11-11",
        toDate: currentYear + "-11-13",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(updateLeaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: " ",
        toDate: currentYear + "-08-12",
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-11-11",
        toDate: currentYear + "-11-13",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(updateLeaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: currentYear + "-08-10",
        toDate: " ",
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-11-11",
        toDate: currentYear + "-11-13",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(updateLeaveApplication).save()
    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: currentYear + "-08-10",
        toDate: currentYear + "-08-12",
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-11-11",
        toDate: currentYear + "-11-13",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(updateLeaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: currentYear + "-08-10",
        toDate: currentYear + "-08-12",
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-11-11",
        toDate: currentYear + "-11-13",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(updateLeaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: currentYear + "-08-10",
        toDate: currentYear + "-08-12",
        leaveStatus: 'Approved',
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-11-11",
        toDate: currentYear + "-11-13",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-11-11",
        toDate: currentYear + "-11-13",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-11-11",
        toDate: currentYear + "-11-13",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-11-11",
        toDate: currentYear + "-11-13",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
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
        employeeId: userId,
        reason: "Travelling",
        leaveType: "CL",
        fromDate: currentYear + "-08-10",
        toDate: currentYear + "-08-12",
        leaveStatus: 'Approved',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(approvedLeaveStatus).save()
    const response = await request(app).delete(`/user/leave/delete?id=${leaveId}`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(400)
    const deleteLeaveApp = await Leave.findById(leaveId)
    expect(deleteLeaveApp).not.toBeNull()
})

// Sandwitch Leave scenario 

test('Should not apply for leave if leave sandwitch, including connecting leaves, weekend before fromDate', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const approvedLeaveStatus = {
        _id: leaveId,
        employeeId: userId,
        reason: "Travelling",
        leaveType: "CL",
        fromDate: currentYear + "-12-01",
        toDate: currentYear + "-12-04",
        leaveStatus: 'Approved',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(approvedLeaveStatus).save()

    const leaveId1 = new mongoose.Types.ObjectId()
    const approvedLeaveStatus1 = {
        _id: leaveId1,
        employeeId: userId,
        reason: "PTO",
        leaveType: "CL",
        fromDate: currentYear + "-12-09",
        toDate: currentYear + "-12-10",
        leaveStatus: 'Approved',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(approvedLeaveStatus1).save()

    const leaveId2 = new mongoose.Types.ObjectId()
    const approvedLeaveStatus2 = {
        _id: leaveId2,
        employeeId: userId,
        reason: "Sick",
        leaveType: "CL",
        fromDate: currentYear + "-12-07",
        toDate: currentYear + "-12-08",
        leaveStatus: 'Approved',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }

    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(approvedLeaveStatus2)
        .expect(400)
    const leave = await Leave.findOne({ employeeId: userId, fromDate: approvedLeaveStatus2.fromDate, toDate: approvedLeaveStatus2.toDate })//Todo - Add from, to,reason
    expect(leave).toBeNull()
})

test('Should not apply for leave if leave sandwitch, including connecting leaves, weekend before todate', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const approvedLeaveStatus = {
        _id: leaveId,
        employeeId: userId,
        reason: "Travelling",
        leaveType: "CL",
        fromDate: currentYear + "-12-10",
        toDate: currentYear + "-12-12",
        leaveStatus: 'Approved',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(approvedLeaveStatus).save()

    const leaveId1 = new mongoose.Types.ObjectId()
    const approvedLeaveStatus1 = {
        _id: leaveId1,
        employeeId: userId,
        reason: "PTO",
        leaveType: "CL",
        fromDate: currentYear + "-12-17",
        toDate: currentYear + "-12-20",
        leaveStatus: 'Approved',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(approvedLeaveStatus1).save()

    const leaveId2 = new mongoose.Types.ObjectId()
    const approvedLeaveStatus2 = {
        _id: leaveId2,
        employeeId: userId,
        reason: "Sick",
        leaveType: "CL",
        fromDate: currentYear + "-12-13",
        toDate: currentYear + "-12-16",
        leaveStatus: 'Approved',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }

    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(approvedLeaveStatus2)
        .expect(400)
    const leave = await Leave.findOne({ employeeId: userId, fromDate: approvedLeaveStatus2.fromDate, toDate: approvedLeaveStatus2.toDate })//Todo - Add from, to,reason
    expect(leave).toBeNull()
})


test('Should not apply for leave if leave sandwitch, including connecting leaves, weekend & holiday before fromDate', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const approvedLeaveStatus = {
        _id: leaveId,
        employeeId: userId,
        reason: "Travelling",
        leaveType: "CL",
        fromDate: currentYear + "-12-16",
        toDate: currentYear + "-12-19",
        leaveStatus: 'Approved',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(approvedLeaveStatus).save()

    const leaveId1 = new mongoose.Types.ObjectId()
    const approvedLeaveStatus1 = {
        _id: leaveId1,
        employeeId: userId,
        reason: "PTO",
        leaveType: "CL",
        fromDate: currentYear + "-12-25",
        toDate: currentYear + "-12-26",
        leaveStatus: 'Approved',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(approvedLeaveStatus1).save()
// 23 is holiday
    const leaveId2 = new mongoose.Types.ObjectId()
    const approvedLeaveStatus2 = {
        _id: leaveId2,
        employeeId: userId,
        reason: "Sick",
        leaveType: "CL",
        fromDate: currentYear + "-12-20",
        toDate: currentYear + "-12-24",
        leaveStatus: 'Approved',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }

    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(approvedLeaveStatus2)
        .expect(400)
    const leave = await Leave.findOne({ employeeId: userId, fromDate: approvedLeaveStatus2.fromDate, toDate: approvedLeaveStatus2.toDate })//Todo - Add from, to,reason
    expect(leave).toBeNull()
})

test('Should not apply for leave if leave sandwitch, including connecting leaves, weekend & holiday after toDate', async () => {
    const leaveId = new mongoose.Types.ObjectId()
    const approvedLeaveStatus = {
        _id: leaveId,
        employeeId: userId,
        reason: "Travelling",
        leaveType: "CL",
        fromDate: currentYear + "-12-16",
        toDate: currentYear + "-12-19",
        leaveStatus: 'Approved',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(approvedLeaveStatus).save()

    const leaveId1 = new mongoose.Types.ObjectId()
    const approvedLeaveStatus1 = {
        _id: leaveId1,
        employeeId: userId,
        reason: "PTO",
        leaveType: "CL",
        fromDate: currentYear + "-12-24",
        toDate: currentYear + "-12-26",
        leaveStatus: 'Approved',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }
    await new Leave(approvedLeaveStatus1).save()
// 23 is holiday
    const leaveId2 = new mongoose.Types.ObjectId()
    const approvedLeaveStatus2 = {
        _id: leaveId2,
        employeeId: userId,
        reason: "Sick",
        leaveType: "CL",
        fromDate: currentYear + "-12-20",
        toDate: currentYear + "-12-20",
        leaveStatus: 'Approved',
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }

    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(approvedLeaveStatus2)
        .expect(400)
    const leave = await Leave.findOne({ employeeId: userId, fromDate: approvedLeaveStatus2.fromDate, toDate: approvedLeaveStatus2.toDate })//Todo - Add from, to,reason
    expect(leave).toBeNull()
})

