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
    tokens: [{
        token: jwt.sign({ _id: userId }, process.env.JWT_SECRETKEY)
    }]
}

const leaveAppId = new mongoose.Types.ObjectId()
const leaveApplication = {
    _id: leaveAppId,
    employeeCode: user.employeeCode,
    reason: "Travelling",
    leaveType: "EL",
    fromDate: "2019-07-11",
    toDate: "2019-07-13"
}

beforeEach(async () => {
    await User.deleteMany()
    await Leave.deleteMany()
    await new User(user).save()
})


test('User apply for leave', async () => {
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplication)
        .expect(201)
    const user = await Leave.findOne({ employeeCode: logUser.employeeCode })
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        leave: {
            employeeCode: leaveApplication.employeeCode,
            reason: leaveApplication.reason,
            leaveType: leaveApplication.leaveType,
        }
    })
    expect(new Date(leaveApplication.fromDate)).toEqual(new Date(user.fromDate))
    expect(new Date(leaveApplication.toDate)).toEqual(new Date(user.toDate))
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
        fromDate: "2019-07-11",
        toDate: "2019-17-13"
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

test('Update User leave application', async () => {
    await new Leave(leaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: "2019-08-10",
        toDate: "2019-08-12"
    }
    const response = await request(app).patch(`/user/leave/update?id=${leaveAppId}`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(modifiedLeave)
        .expect(200)
    const modifiedLeaveApp = await Leave.findById(leaveAppId)
    expect(modifiedLeaveApp).not.toBeNull()

    expect(modifiedLeave.reason).toEqual(modifiedLeaveApp.reason)
    expect(modifiedLeave.leaveType).toEqual(modifiedLeaveApp.leaveType)
    expect(new Date(modifiedLeave.fromDate)).toEqual(new Date(modifiedLeaveApp.fromDate))
    expect(new Date(modifiedLeave.toDate)).toEqual(new Date(modifiedLeaveApp.toDate))
})

test('Should not update if from date is missing', async () => {
    await new Leave(leaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: " ",
        toDate: "2019-08-12"
    }
    const response = await request(app).patch(`/user/leave/update?id=`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(modifiedLeave)
        .expect(400)
})

test('Should not update if to date is missing', async () => {
    await new Leave(leaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: "2019-08-10",
        toDate: " "
    }
    const response = await request(app).patch(`/user/leave/update?id=`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(modifiedLeave)
        .expect(400)
})

test('Should not update if query string is missing', async () => {
    await new Leave(leaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: "2019-08-10",
        toDate: "2019-08-12"
    }
    const response = await request(app).patch(`/user/leave/update?id=`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(modifiedLeave)
        .expect(400)
})

test('Should not update if query string is invalid', async () => {
    await new Leave(leaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: "2019-08-10",
        toDate: "2019-08-12"
    }
    const response = await request(app).patch(`/user/leave/update?id=5d25ba6ab64f4642d83ef336`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(modifiedLeave)
        .expect(400)
})

test('Should not update if leave status is Approved/Rejected/Cancelled', async () => {
    await new Leave(leaveApplication).save()

    const modifiedLeave = {
        reason: "Travelling",
        leaveType: "CL",
        fromDate: "2019-08-10",
        toDate: "2019-08-12",
        leaveStatus: 'Approved'
    }
    const response = await request(app).patch(`/user/leave/update?id=5d25ba6ab64f4642d83ef336`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send(modifiedLeave)
        .expect(400)
})

test('Delete leave application', async () => {
    await new Leave(leaveApplication).save()
    const response = await request(app).delete(`/user/leave/delete?id=${leaveAppId}`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(200)
    const deleteLeaveApp = await Leave.findById(leaveAppId)
    expect(deleteLeaveApp).toBeNull()
})

test('Should not delete if query string missing', async () => {
    await new Leave(leaveApplication).save()
    const response = await request(app).delete(`/user/leave/delete`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(400)
    const deleteLeaveApp = await Leave.findById(leaveAppId)
    expect(deleteLeaveApp).not.toBeNull()
})

test('Should not delete if query string invalid', async () => {
    await new Leave(leaveApplication).save()
    const response = await request(app).delete(`/user/leave/delete?id=afsdfsdfsfsdf`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(400)
    const deleteLeaveApp = await Leave.findById(leaveAppId)
    expect(deleteLeaveApp).not.toBeNull()
})

test('Should not delete if query string invalid', async () => {
    await new Leave(leaveApplication).save()
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
        leaveStatus: 'Approved'
    }
    await new Leave(approvedLeaveStatus).save()
    const response = await request(app).delete(`/user/leave/delete?id=${leaveId}`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send()
        .expect(400)
    const deleteLeaveApp = await Leave.findById(leaveId)
    expect(deleteLeaveApp).not.toBeNull()
})