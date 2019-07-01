const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')
const auth = require('../src/middleware/auth')

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

test('Add new user', async () => {
    const response = await request(app).post('/users').send(newUser).expect(201)

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
        },
        token: user.tokens[0].token
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

    const response = await request(app).post('/users').send(newUser1).expect(400)

    const user = await User.findOne({email: newUser1.email})
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

    const response = await request(app).post('/users').send(newUser1).expect(400)

    const user = await User.findOne({email: newUser1.email})
    expect(user).toBeNull()
})


test('Login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: user.email,
        password: user.password
    }).expect(200)
    const existingUser = await User.findById(userId)
    expect(response.body.token).toBe(existingUser.tokens[1].token)
})


test('Should not login while incorrect password', async () => {
    const response = await request(app).post('/users/login').send({
        email: user.email,
        password: user.password +'k'
    }).expect(401)
    const existingUser = await User.findOne({email: user.email, password: user.password+'k'})
    expect(existingUser).toBeNull()
})

test('Logout user', async () => {

    const token = user.tokens[0].token
    const response = await request(app)
        .post('/users/logout')
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(200)
    
   const logoutUser = await User.findById(userId)
   expect(logoutUser.tokens.length).toEqual(0)
})

// test('Get Profile for User', async() => {
//     await request(app)
//     //.set('Authorization', `Bearer ${userTest.tokens[0].token}`)
//     .get('/users/me')
//     .send()
//     .expect(200)
// })