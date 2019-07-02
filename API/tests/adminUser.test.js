const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const adminUser = require('../src/models/adminUser')
const auth = require('../src/middleware/auth')


beforeEach(async () => {
    
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