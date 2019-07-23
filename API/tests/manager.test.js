const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

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
 

beforeEach(async () => {
    await User.deleteMany()
    await new User(managerUser).save()
})


test('Get Manager reporting employee list', async() => {
    await new User(user).save()
    const response = await request(app).get('/manager/user/list')
        .set('Authorization', `Bearer ${managerUser.tokens[0].token}`)
        .send()
        .expect(200)
    const checkManager = await User.countDocuments({managerEmployeeCode: managerUser.employeeCode})
    expect(checkManager).toBeGreaterThan(0)
})

