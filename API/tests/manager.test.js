const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')
const Leave = require('../src/models/leave')

const managerUserId = new mongoose.Types.ObjectId()
const managerUser = {
    _id: managerUserId,
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
        token: jwt.sign({ _id: managerUserId }, process.env.JWT_SECRETKEY)
    }]
}


const userId = new mongoose.Types.ObjectId()
const user = {
    _id: userId,
    employeeCode: 'VT_002',
    firstName: 'Sonali',
    lastName: 'Konge',
    password: 'Sonali123',
    email: 'sonali@gmail.com',
    managerEmployeeCode: managerUser.employeeCode,
    isHR: true,
    department: 'Marketing',
    employeeStatus: 'Permanent',
    dateOfJoining: '2020-06-27T06:17:07.654Z',
    tokens: [{
        token: jwt.sign({ _id: userId }, process.env.JWT_SECRETKEY)
    }]
}

const newUserId = new mongoose.Types.ObjectId()
const newUser = {
    _id: newUserId,
    employeeCode: 'VT_004',
    firstName: 'XYZ',
    lastName: 'XYZ',
    password: 'Xyz123',
    email: 'xyz@gmail.com',
    managerEmployeeCode: user.employeeCode,
    isHR: true,
    department: 'Marketing',
    employeeStatus: 'Permanent',
    dateOfJoining: '2020-06-27T06:17:07.654Z',
    tokens: [{
        token: jwt.sign({ _id: newUserId }, process.env.JWT_SECRETKEY)
    }]
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(managerUser).save()
})


test('Get Manager reporting employee list', async () => {
    await new User(user).save()
    const response = await request(app).get('/manager/user/list')
        .set('Authorization', `Bearer ${managerUser.tokens[0].token}`)
        .send()
        .expect(200)
    const checkManager = await User.countDocuments({ managerEmployeeCode: managerUser.employeeCode })
    expect(checkManager).toBeGreaterThan(0)
})

test('Should not get employee list if user is not manager', async () => {
    await new User(newUser).save()
    const response = await request(app).get('/manager/user/list')
        .set('Authorization', `Bearer ${newUser.tokens[0].token}`)
        .send()
        .expect(400)
    const checkManager = await User.countDocuments({ managerEmployeeCode: newUser.employeeCode })
    expect(checkManager).toBe(0)
})

test('Get recursive Manager reporting employee list', async () => {
    await new User(user).save()
    await new User(newUser).save()
    const response = await request(app).get('/manager/user/reclist')
        .set('Authorization', `Bearer ${managerUser.tokens[0].token}`)
        .send()
        .expect(200)
    const checkManager = await User.countDocuments({ managerEmployeeCode: managerUser.employeeCode })
    expect(checkManager).toBeGreaterThan(0)
})

test('Should not get recursive employee list if user is not manager', async () => {
    await new User(newUser).save()
    const response = await request(app).get('/manager/user/reclist')
        .set('Authorization', `Bearer ${newUser.tokens[0].token}`)
        .send()
        .expect(400)
    const checkManager = await User.countDocuments({ managerEmployeeCode: newUser.employeeCode })
    expect(checkManager).toBe(0)
})

test('Manager change leave Status for employee', async () => {
    await new User(user).save()
    const leaveId = new mongoose.Types.ObjectId()
    const leaveApplication = {
        _id: leaveId,
        employeeCode: user.employeeCode,
        reason: "Travelling",
        fromDate: "2019-12-11",
        toDate: "2019-12-13",
        leaveType: "CL",
        leavePlanned: true
    }
    await new Leave(leaveApplication).save()
    const changeStatusLeaveApplication = {
        "managerNote": "Leave approved",
        "leaveStatus": "Approved"
    }
    const response = await request(app).patch(`/manager/user/changeLeaveStatus?leaveId=${leaveId}`)
        .set('Authorization', `Bearer ${managerUser.tokens[0].token}`)
        .send(changeStatusLeaveApplication)
        .expect(200)

    const updatedLeaveStatus = await Leave.findOne({ _id: leaveId })
    expect(updatedLeaveStatus).not.toBeNull()

    expect(changeStatusLeaveApplication.managerNote).toEqual(updatedLeaveStatus.managerNote)
    expect(changeStatusLeaveApplication.leaveStatus).toEqual(updatedLeaveStatus.leaveStatus)
})

// test('Manager should not change leave Status for employee if leaveid is missing', async () => {
//     await new User(user).save()
//     const leaveId = new mongoose.Types.ObjectId()
//     const leaveApplication = {
//         _id: leaveId,
//         employeeCode: user.employeeCode,
//         reason: "Travelling",
//         fromDate: "2019-12-11",
//         toDate: "2019-12-13",
//         leaveType: "CL",
//         leavePlanned: true
//     }
//     await new Leave(leaveApplication).save()
//     const changeStatusLeaveApplication = {
//         "managerNote": "Leave approved",
//         "leaveStatus": "Approved"
//     }
//     const response = await request(app).patch(`/manager/user/changeLeaveStatus?leaveId=${leaveId}`)
//         .set('Authorization', `Bearer ${managerUser.tokens[0].token}`)
//         .send(changeStatusLeaveApplication)
//         .expect(200)
// })