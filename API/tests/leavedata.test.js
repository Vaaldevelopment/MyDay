const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')
const LeaveData = require('../src/models/leavedata')

const today = new Date()
const currentYear = today.getFullYear()

const hrId = new mongoose.Types.ObjectId()
const hrUser = {
    _id: hrId,
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
        token: jwt.sign({ _id: hrId }, process.env.JWT_SECRETKEY)
    }]
}

const userId = new mongoose.Types.ObjectId()
const user = {
    _id: userId,
    employeeCode: 'VT_002',
    firstName: 'UserFirstName',
    lastName: 'UserLastname',
    password: 'UserPass123',
    email: 'user@gmail.com',
    managerEmployeeCode: 'VT100',
    isHR: false,
    department: 'Marketing',
    employeeStatus: 'Permanent',
    dateOfJoining: currentYear + '-08-27T06:17:07.654Z',
    tokens: [{
        token: jwt.sign({ _id: userId }, process.env.JWT_SECRETKEY)
    }]
}

beforeEach(async () => {
    await User.deleteMany()
    await LeaveData.deleteMany()
    await new User(hrUser).save()
})


test('Add user leaves data for year with carry forward leave', async () => {
    const leaveDataId = new mongoose.Types.ObjectId()
    const userLeaveData = {
        _id: leaveDataId,
        employeeId: userId,
        year: currentYear.toString(),
        earnedLeave: 18,
        casualLeave: 8,
        carryForwardLeave: 10,
        carryForwardFlag: true,
        maternityFlag: false,
        maternityLeave: 0
    }
    const logUser = await User.findById(hrId)
    const response = await request(app).post('/user/leavedata/add')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(userLeaveData)
        .expect(201)

    const leaveData = await LeaveData.findOne({ employeeId: userId, _id: leaveDataId, year: currentYear })
    expect(leaveData).not.toBeNull()
    expect(userLeaveData.year).toEqual(leaveData.year)
})

test('Update user leaves data', async () => {
    const leaveDataId = new mongoose.Types.ObjectId()
    const userLeaveData = {
        _id: leaveDataId,
        employeeId: userId,
        year: currentYear.toString(),
        earnedLeave: 18,
        casualLeave: 8,
        carryForwardLeave: 10,
        carryForwardFlag: true,
        maternityFlag: false,
        maternityLeave: 0
    }

    await new LeaveData(userLeaveData).save()

    const userLeaveDataUpdate = {
        employeeId: userId,
        year: currentYear.toString(),
        earnedLeave: 20,
        casualLeave: 6,
        carryForwardLeave: 0,
        carryForwardFlag: false,
        maternityFlag: false,
        maternityLeave: 0
    }

    const logUser = await User.findById(hrId)
    const response = await request(app).post('/user/leavedata/add')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(userLeaveDataUpdate)
        .expect(200)

    const leaveData = await LeaveData.findOne({ employeeId: userId, _id: leaveDataId, year: currentYear })
    expect(leaveData).not.toBeNull()
    expect(userLeaveDataUpdate.year).toEqual(leaveData.year)
    expect(userLeaveDataUpdate.earnedLeave).toEqual(leaveData.earnedLeave)
    expect(userLeaveDataUpdate.casualLeave).toEqual(leaveData.casualLeave)
    expect(userLeaveDataUpdate.carryForwardFlag).toEqual(leaveData.carryForwardFlag)
})

test('Should not add user leaves if year missing', async () => {
    const leaveDataId = new mongoose.Types.ObjectId()
    const userLeaveData = {
        _id: leaveDataId,
        employeeId: userId,
        earnedLeave: 18,
        casualLeave: 8,
        carryForwardLeave: 10,
        carryForwardFlag: true,
        maternityFlag: false,
        maternityLeave: 0
    }
    const logUser = await User.findById(hrId)
    const response = await request(app).post('/user/leavedata/add')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(userLeaveData)
        .expect(400)

    const leaveData = await LeaveData.findOne({ employeeId: userId, _id: leaveDataId })
    expect(leaveData).toBeNull()
})

test('should not update user leaves data if user/year missing', async () => {
    const leaveDataId = new mongoose.Types.ObjectId()
    const userLeaveData = {
        _id: leaveDataId,
        employeeId: userId,
        year: currentYear.toString(),
        earnedLeave: 18,
        casualLeave: 8,
        carryForwardLeave: 10,
        carryForwardFlag: true,
        maternityFlag: false,
        maternityLeave: 0
    }

    await new LeaveData(userLeaveData).save()

    const userLeaveDataUpdate = {
        earnedLeave: 20,
        casualLeave: 6,
        carryForwardLeave: 0,
        carryForwardFlag: false,
        maternityFlag: false,
        maternityLeave: 0
    }

    const logUser = await User.findById(hrId)
    const response = await request(app).post('/user/leavedata/add')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(userLeaveDataUpdate)
        .expect(400)
})

test('Get employee leave data', async () => {
    const leaveDataId = new mongoose.Types.ObjectId()
    const userLeaveData = {
        _id: leaveDataId,
        employeeId: userId,
        year: currentYear.toString(),
        earnedLeave: 18,
        casualLeave: 8,
        carryForwardLeave: 10,
        carryForwardFlag: true,
        maternityFlag: false,
        maternityLeave: 0
    }

    await new LeaveData(userLeaveData).save()

    const logUser = await User.findById(hrId)
    const response = await request(app).get(`/user/leavedata/employee?empId=${userId}&year=${userLeaveData.year}`)
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send()
        .expect(200)
    const responseLeaveData = response.body.empLeaveData[0]
    expect(responseLeaveData.year).toEqual(userLeaveData.year)
    expect(responseLeaveData.earnedLeave).toEqual(userLeaveData.earnedLeave)
    expect(responseLeaveData.casualLeave).toEqual(userLeaveData.casualLeave)
})

test('Add leave data for all employee', async () => {
    const userLeaveData = {
        year: currentYear.toString(),
        earnedLeave: 18,
        casualLeave: 8,
    }

    const logUser = await User.findById(hrId)
    const response = await request(app).post(`/leavedata/toall`)
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(userLeaveData)
        .expect(201)
})

test('Should not add leave data to all employee if year missing', async () => {
    const userLeaveData = {
        earnedLeave: 18,
        casualLeave: 8,
    }

    const logUser = await User.findById(hrId)
    const response = await request(app).post(`/leavedata/toall`)
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(userLeaveData)
        .expect(400)
})