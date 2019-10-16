const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const User = require('../src/models/user')
const admin = require('../src/models/admin')
const DefaultLeave = require('../src/models/defaultLeave')

const defaultLeaveId = new mongoose.Types.ObjectId()
const newdefaultLeave = {
    _id: defaultLeaveId,
    casualLeaves: 20,
    earnedLeaves: 10,
    maternityLeaves: 60
}

beforeEach(async () => {
    await DefaultLeave.deleteMany()
    await new DefaultLeave(newdefaultLeave).save()
})

// test('Add defaultLeave', async () => {
//     const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRETKEY)
//     process.env.ADMINTOKEN = token
//     admin.token = token

//     const response = await request(app).post('/settings/defaultleaves/add')
//         .set('Authorization', `Bearer ${token}`)
//         .send(newdefaultLeave)
//         .expect(201)
//     const AdddefaultLeave = await DefaultLeave.findOne({ _id: defaultLeaveId })
//     expect(AdddefaultLeave).not.toBeNull()
//     expect(newdefaultLeave.casualLeaves).toEqual(AdddefaultLeave.casualLeaves)
// })

test('Admin Update defaultLeave', async () => {
    const modifiedLeaves = {
        defaultLeavesId: defaultLeaveId,
        casualLeaves: 10,
        earnedLeaves: 10,
        maternityLeaves: 60
    }
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRETKEY)
    process.env.ADMINTOKEN = token
    admin.token = token

    const response = await request(app).patch('/settings/defaultleaves/edit')
        .set('Authorization', `Bearer ${token}`)
        .send(modifiedLeaves)
        .expect(200)
    const AdddefaultLeave = await DefaultLeave.findOne({ _id: defaultLeaveId })
    expect(AdddefaultLeave).not.toBeNull()
    expect(modifiedLeaves.casualLeaves).toEqual(AdddefaultLeave.casualLeaves)
    expect(modifiedLeaves.earnedLeaves).toEqual(AdddefaultLeave.earnedLeaves)
    expect(modifiedLeaves.maternityLeaves).toEqual(AdddefaultLeave.maternityLeaves)
})

test('Admin Get defaultLeave', async () => {
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRETKEY)
    process.env.ADMINTOKEN = token
    admin.token = token

    const response = await request(app).get('/settings/defaultleaves/list')
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(200)
})