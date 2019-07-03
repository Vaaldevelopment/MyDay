const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const adminUser = require('../src/models/adminUser')
const auth = require('../src/middleware/auth')
const User = require('../src/models/user')

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
    await new User(user).save()
})

test('Login admin', async () => {
    const response = await request(app).post('/admin/login').send(adminUser).expect(200)
    expect(response.body.token).toEqual(adminUser.token)
})

test('Should not login admin for invalid credentials', async () => {
    const response = await request(app).post('/admin/login').send({
        userName: 'admin',
        password: 'Incorrect'
    }).expect(401)
})

test('Logout admin', async () => {
    const token = jwt.sign({ _id: adminUser._id.toString() }, process.env.JWT_SECRETKEY)
    adminUser.token = token
    const response = await request(app).post('/admin/logout')
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(200)
})

test('Logout admin should fail without token', async () => {
    const token = jwt.sign({ _id: adminUser._id.toString() }, process.env.JWT_SECRETKEY)
    adminUser.token = token
    const response = await request(app).post('/admin/logout')
        .send()
        .expect(401)
})

test('Admin Create New user', async () => {
    const token = jwt.sign({ _id: adminUser._id.toString() }, process.env.JWT_SECRETKEY)
    adminUser.token = token
    const response = await request(app).post('/admin/createuser')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser)
        .expect(201)

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

test('Admin Create New user should fail if required data is not supplied', async () => {
    const token = jwt.sign({ _id: adminUser._id.toString() }, process.env.JWT_SECRETKEY)
    adminUser.token = token

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

    const response = await request(app).post('/admin/createuser')
    .set('Authorization', `Bearer ${token}`)
    .send(newUser1)
    .expect(400)

    const user = await User.findOne({ email: newUser1.email })
    expect(user).toBeNull()
})