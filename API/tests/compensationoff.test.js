const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')
const CompensationOff = require('../src/models/compensationoff')
const Notification = require('../src/models/notification')
const LeaveData = require('../src/models/leavedata')
const today = new Date()
const currentYear = today.getFullYear()


const userManagerId = new mongoose.Types.ObjectId()
const managerUser = {
    _id: userManagerId,
    employeeCode: 'VT_002',
    firstName: 'firstNameManager',
    lastName: 'LastnameManager',
    password: 'Manager123',
    email: 'manager@gmail.com',
    managerEmployeeCode: 'VT_001',
    isHR: true,
    department: 'Marketing',
    employeeStatus: 'Permanent',
    dateOfJoining: currentYear + '-05-28T06:17:07.654Z',
    tokens: [{
        token: jwt.sign({ _id: userManagerId }, process.env.JWT_SECRETKEY)
    }]
}

const userId = new mongoose.Types.ObjectId()
const user = {
    _id: userId,
    employeeCode: 'VT_001',
    firstName: 'firstName',
    lastName: 'Lastname',
    password: 'Pass123',
    email: 'pass@gmail.com',
    managerEmployeeCode: userManagerId,
    isHR: false,
    department: 'Marketing',
    employeeStatus: 'Permanent',
    dateOfJoining: currentYear + '-06-27T06:17:07.654Z',
    tokens: [{
        token: jwt.sign({ _id: userId }, process.env.JWT_SECRETKEY)
    }]
}

const compOff = {
    employeeId: user._id,
    reasonCO: "Travelling",
    fromDateCO: currentYear + "-12-11",
    toDateCO: currentYear + "-12-13",
    fromSpanCO: "FULL DAY",
    toSpanCO: "FULL DAY",
    statusCO: 'Pending'
}

const userLeaveData = {
    employeeId: user._id,
    year: currentYear.toString(),
    earnedLeave: 18,
    casualLeave: 8,
    carryForwardLeave: 10,
    carryForwardFlag: true,
    maternityFlag: false,
    maternityLeave: 0
}

beforeEach(async () => {
    await User.deleteMany()
    await CompensationOff.deleteMany()
    await Notification.deleteMany()
    await new User(user).save()
    await new User(managerUser).save()
    await new CompensationOff(compOff).save()
    await new LeaveData(userLeaveData).save()
})

test('User compoff list', async () => {
    const logUser = await User.findById(userId)
    const response = await request(app).get('/user/compOff/list')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send()
        .expect(200)
    const responseLeave = response.body.compOffList[0]
    expect(new Date(responseLeave.fromDateCO)).toEqual(new Date(compOff.fromDateCO))
    expect(new Date(responseLeave.toDateCO)).toEqual(new Date(compOff.toDateCO))
    expect(responseLeave.reasonCO).toEqual(compOff.reasonCO)
})

test('Selected user compoff list', async () => {
    const logUser = await User.findById(userManagerId)
    const response = await request(app).get('/user/compOff/selecteduserlist?userId=' + user._id)
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send()
        .expect(200)
    const responseLeave = response.body.compOffList[0]
    expect(new Date(responseLeave.fromDateCO)).toEqual(new Date(compOff.fromDateCO))
    expect(new Date(responseLeave.toDateCO)).toEqual(new Date(compOff.toDateCO))
    expect(responseLeave.reasonCO).toEqual(compOff.reasonCO)
})

// test('Apply comp off', async () => {
//     const compOffApply = {
//         employeeId: userId,
//         reasonCO: "Travelling",
//         fromDateCO: currentYear + "-12-28",
//         toDateCO: currentYear + "-12-28",
//         fromSpanCO: "FULL DAY",
//         toSpanCO: "FULL DAY",
//         statusCO: 'Pending'
//     }

//     const logUser = await User.findById(userId)
//     const response = await request(app).post('/user/compOff/apply')
//         .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
//         .send(compOffApply)
//         .expect(201)

//     // const CompOff = await CompensationOff.findOne({ employeeId: userId, fromDateCO: compOffApply.fromDateCO, toDateCO: compOffApply.toDateCO })
//     // expect(CompOff).not.toBeNull()
// })