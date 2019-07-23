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

const leaveApplication = {
    employeeCode: user.employeeCode,
    reason: "Travelling",
    fromDate: "2019-11-11",
    toDate: "2019-11-13",
    leaveType: "CL",
    leavePlanned: true
}

beforeEach(async () => {
    await User.deleteMany()
    await Leave.deleteMany()
    await new User(user).save()
})



test('User leave list', async () => {

    const leaveApplication1 = {
        employeeCode: user.employeeCode,
        reason: "Travelling",
        fromDate: "2019-11-01",
        toDate: "2019-11-02",
        leaveType: "CL",
        leavePlanned: true
    }
    await new Leave(leaveApplication1).save()

    const leaveApplication2 = {
        employeeCode: user.employeeCode,
        reason: "Sick",
        fromDate: "2019-11-10",
        toDate: "2019-11-15",
        leaveType: "CL",
        leavePlanned: true
    }
    await new Leave(leaveApplication2).save()

    const leaveApplication3 = {
        employeeCode: user.employeeCode,
        reason: "PTO",
        fromDate: "2019-12-20",
        toDate: "2019-12-31",
        leaveType: "CL",
        leavePlanned: false
    }
    await new Leave(leaveApplication3).save()

    const logUser = await User.findById(userId)
    const response = await request(app).get('/user/leave/list')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send()
        .expect(200)

    const responseLeave1 = response.body[0]
    expect(new Date(responseLeave1.fromDate)).toEqual(new Date(leaveApplication1.fromDate))
    expect(new Date(responseLeave1.toDate)).toEqual(new Date(leaveApplication1.toDate))
    expect(responseLeave1.reason).toEqual(leaveApplication1.reason)

    const responseLeave2 = response.body[1]
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
    const leave = await Leave.findOne({ employeeCode: logUser.employeeCode, fromDate: leaveApplication.fromDate, toDate: leaveApplication.toDate })//Todo - Add from, to,reason
    expect(leave).not.toBeNull()
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

test('Should not apply for leave if toDate is previous leaves fromDate ', async () => {
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

test('Should not apply for leave if toDate is previous leaves toDate', async () => {
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
            reason: "Travelling",
            leaveType: "CL",
            fromDate: "2019-12-09",
            toDate: "2019-12-12"
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
    const response = await request(app).patch(`/user/leave/update?id=`)
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
    const response = await request(app).patch(`/user/leave/update?id=`)
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
    const response = await request(app).patch(`/user/leave/update?id=`)
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
    const response = await request(app).patch(`/user/leave/update?id=5d25ba6ab64f4642d83ef336`)
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
    const response = await request(app).patch(`/user/leave/update?id=5d25ba6ab64f4642d83ef336`)
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

