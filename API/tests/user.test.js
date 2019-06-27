const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

const userTestId = new mongoose.Types.ObjectId()
const userTest = {
    _id: userTestId,
    employeeCode: 'VT_001',
    firstName : 'firstName',
    lastName: 'Lastname',
    password: 'Pass123',
    email: 'pass@gmail.com',
    managerEmployeeCode: 'VT100',
    isHR: true,
    department: 'Marketing',
    employeeStatus: 'Permenant',
    dateOfJoining:'2020-06-27 06:17:07.654Z',
    tokens: [{
        token: jwt.sign({_id: userTestId}, process.env.JWT_SECRETKEY)
    }]
}

beforeEach( async() => {
    await User.deleteMany()
    await new User(userTest).save()
})

// No need to add tests for models, directly add for routers.
// test('User model required field', async () => {
//     const user = await new User()
//     user.validate((error) => {
//        if(error)
//        {
//             expect(error.errors.employeeCode.kind).toBe("required");
//             expect(error.errors.firstName.kind).toBe("required");
//         // for (field in error.errors) {
//         //     expect(error.errors[field].kind).toBe("required");
//         //     //expect(error.errors[field]).toHaveProperty('firstName.required',true);
//         // }
//        }
//     });
// })

test('Add new user', async () => {
   const response = await request(app).post('/users').send({
        employeeCode: 'VT_002',
        firstName : 'Sonali',
        lastName: 'Konge',
        password: 'Sonali123',
        email: 'sonali@gmail.com',
        managerEmployeeCode: 'VT10',
        isHR: true,
        department: 'Marketing',
        employeeStatus: 'Permenant',
        dateOfJoining:'2020-06-27 06:17:07.654Z',
    }).expect(201)

        // database was changed correctly
        const user = await User.findById(response.body.user._id)
        expect(user).not.toBeNull()

        //Response
        //expect(response.body.user.firstName).toBe('Sonali')
        expect(response.body).toMatchObject({
            user: {
                firstName: 'Sonali',
                email: 'sonali@gmail.com'
            },
            token: user.tokens[0].token
        })
        expect(user.password).not.toBe('Sonali123')
})

test('Login existing user', async() => {
   const response = await request(app).post('/users/login').send({
        email:userTest.email,
        password:userTest.password
    }).expect(200)
    const user = await User.findById(userTestId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

// test('Get Profile for User', async() => {
//     await request(app)
//     //.set('Authorization', `Bearer ${userTest.tokens[0].token}`)
//     .get('/users/me')
//     .send()
//     .expect(200)
// })