const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const user = require('../src/models/user')

// beforeEach((async) => {

// })


test('signup new user', async () => {
    await request(app).post('/users').send({
        firstName : 'Pravin',
        password: 'Pravin123',
        email: 'pravin@gmail.com'
    }).expect(201)
})