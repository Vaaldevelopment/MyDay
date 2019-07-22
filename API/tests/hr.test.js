const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
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
    const response = await request(app).post('/hr/user/create')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
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
    const response = await request(app).post('/hr/user/create')
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
    const response = await request(app).post('/hr/user/create')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(newUser1).expect(400)

    const user = await User.findOne({ email: newUser1.email })
    expect(user).toBeNull()
})

// Update User :-

test('Update existing user', async () => {
    await new User(newUser).save()
    const modifiedUser = {
        employeeCode: newUser.employeeCode,
        firstName: 'UpFirstName',
        lastName: 'UpLastName',
        password: 'Uppass123',
        email: 'Uppass@gmail.com',
        managerEmployeeCode: 'VT101',
        department: 'Marketing',
        employeeStatus: 'Permenant',
        dateOfJoining: '2020-06-27T06:17:07.654Z'
    }
    const response = await request(app).patch('/hr/user/update')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(modifiedUser)
        .expect(200)
    const modifiedUser1 = await User.findOne({ employeeCode: newUser.employeeCode })
    expect(modifiedUser1).not.toBeNull()

    expect(modifiedUser.employeeCode).toEqual(modifiedUser1.employeeCode)
    expect(modifiedUser.firstName).toEqual(modifiedUser1.firstName)
    expect(modifiedUser.lastName).toEqual(modifiedUser1.lastName)
    expect(modifiedUser.email.toLowerCase()).toEqual(modifiedUser1.email)
    expect(modifiedUser.managerEmployeeCode).toEqual(modifiedUser1.managerEmployeeCode)
    expect(modifiedUser.department).toEqual(modifiedUser1.department)
    expect(modifiedUser.employeeStatus).toEqual(modifiedUser1.employeeStatus)

    const expectedDate = new Date(modifiedUser.dateOfJoining)
    const foundDate = new Date(modifiedUser1.dateOfJoining)
    expect(expectedDate.getTime()).toBe(foundDate.getTime())
})

test('Should not update if invalid employee code', async () => {
    await new User(newUser).save()
    const modifiedUser = {
        employeeCode: 'VT_000',
        firstName: 'TestUpdate'
    }
    const response = await request(app).patch('/hr/user/update')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(modifiedUser)
        .expect(400)
    const modifiedUser1 = await User.findOne({ employeeCode: modifiedUser.employeeCode })
    expect(modifiedUser1).toBeNull()
})

test('Should not update if missing employee code', async () => {
    await new User(newUser).save()
    const modifiedUser = {
        firstName: 'TestUpdate'
    }
    const response = await request(app).patch('/hr/user/update')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(modifiedUser)
        .expect(400)
})

test(' Should not update if invalid update fields', async () => {
    await new User(newUser).save()
    const modifiedUser = {
        employeeCode: 'VT_000',
        firstName: 'TestUpdate',
        height: '5.5 Feet'
    }
    const response = await request(app).patch('/hr/user/update')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(modifiedUser)
        .expect(400)
    const modifiedUser1 = await User.findOne({ employeeCode: modifiedUser.employeeCode })
    expect(modifiedUser1).toBeNull()
})


// Delete User :-

test('Delete existing user', async () => {
    await new User(newUser).save()
    const response = await request(app).delete(`/hr/user/delete/?employeecode=${newUser.employeeCode}`)
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send()
        .expect(200)
    const modifiedUser1 = await User.findOne({ employeeCode: newUser.employeeCode })
    expect(modifiedUser1).toBeNull()
})

test('Should not delete if query string is missing', async () => {
    await new User(newUser).save()
    const response = await request(app).delete('/hr/user/delete/?employeecode=')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send()
        .expect(400)
    const modifiedUser1 = await User.findOne({ employeeCode: newUser.employeeCode })
    expect(modifiedUser1).not.toBeNull()
})

test('Should not delete if query string is invalid', async () => {
    await new User(newUser).save()
    const response = await request(app).delete('/hr/user/delete/?employeecodee=VT_000')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send()
        .expect(400)
    const modifiedUser1 = await User.findOne({ employeeCode: newUser.employeeCode })
    expect(modifiedUser1).not.toBeNull()
})


test('Should not delete if employee does not exist', async () => {
    const response = await request(app).delete('/hr/user/delete/?employeecode=VT_000')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send()
        .expect(400)
    const modifiedUser1 = await User.findOne({ employeeCode: 'VT_000' })
    expect(modifiedUser1).toBeNull()
})