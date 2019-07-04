const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

const hrId = new mongoose.Types.ObjectId()
const hrUser = {
    _id: hrId,
    employeeCode: 'VT_005',
    firstName: 'HR',
    lastName: 'HR',
    password: 'Hr1234',
    email: 'hr@gmail.com',
    managerEmployeeCode: 'VT100',
    isHR: true,
    department: 'HR',
    employeeStatus: 'Permanent',
    dateOfJoining: '2020-06-27T06:17:07.654Z',
    tokens: [{
        token: jwt.sign({ _id: hrId }, process.env.JWT_SECRETKEY)
    }]
}

const newUser = {
    employeeCode: 'VT_002',
    firstName: 'Sonali',
    lastName: 'Konge',
    password: 'Sonali123',
    email: 'sonali@gmail.com',
    managerEmployeeCode: 'VT10',
    isHR: true,
    department: 'Marketing',
    employeeStatus: 'Permanent',
    dateOfJoining: '2020-06-27T06:17:07.654Z'
}


beforeEach(async () => {
    await User.deleteMany()
    await new User(hrUser).save()
})

test('Add new user', async () => {
    const response = await request(app).post('/users/createuser')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(newUser)
        .expect(201)

    console.log(response.body)
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user: {
            employeeCode: newUser.employeeCode,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            managerEmployeeCode: newUser.managerEmployeeCode,
            isHR: newUser.isHR,
            department: newUser.department,
            employeeStatus: newUser.employeeStatus,
            dateOfJoining: newUser.dateOfJoining
        }
    })
    expect(user.password).not.toBe(newUser.password)
})

test('Should not add new user without required information', async () => {
    const newUser1 = {
        firstName: 'Sonali',
        lastName: 'Konge',
        password: 'Sonali123',
        email: 'sonali@gmail.com',
        managerEmployeeCode: 'VT10',
        isHR: true,
        department: 'Marketing',
        employeeStatus: 'Permanent',
        dateOfJoining: '2020-06-27T06:17:07.654Z'
    }
    const response = await request(app).post('/users/createuser')
    .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
    .send(newUser1).expect(400)

    const user = await User.findOne({ email: newUser1.email })
    expect(user).toBeNull()
})

test('Should not add new user if does not meet policy requirments', async () => {
    const newUser1 = {
        firstName: 'Sonali',
        lastName: 'Konge',
        password: 'sonali123',
        email: 'sonali@gmail.com',
        managerEmployeeCode: 'VT10',
        isHR: true,
        department: 'Marketing',
        employeeStatus: 'Permanent',
        dateOfJoining: '2020-06-27T06:17:07.654Z'
    }
    const response = await request(app).post('/users/createuser')
    .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
    .send(newUser1).expect(400)

    const user = await User.findOne({ email: newUser1.email })
    expect(user).toBeNull()
})
