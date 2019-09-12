const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const app = require('../src/app')
const User = require('../src/models/user')
const admin = require('../src/models/admin')
const Department = require('../src/models/department')

const deptId = new mongoose.Types.ObjectId()
const newDepartment = {
    _id: deptId,
    departmentName: 'BS'
}

beforeEach(async () => {
    await User.deleteMany()
    await Department.deleteMany()
})

test('Admin Get department List', async () => {
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRETKEY)
    process.env.ADMINTOKEN = token
    admin.token = token

    const response = await request(app).get('/settings/department/list')
        .set('Authorization', `Bearer ${token}`)
        .send(newDepartment)
        .expect(201)
})

//Should not add duplicate
test('Add department', async () => {
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRETKEY)
    process.env.ADMINTOKEN = token
    admin.token = token

    const response = await request(app).post('/settings/department/add')
        .set('Authorization', `Bearer ${token}`)
        .send(newDepartment)
        .expect(201)
    const addedDept = await Department.findOne({ _id: deptId })
    expect(addedDept).not.toBeNull()
    expect(newDepartment.departmentName).toEqual(addedDept.departmentName)
})

// test('Check duplicate department', async () => {
//     const response = await request(app).get('/settings/department/checkDuplicatedepartment?departmentString=Marketing')
//         .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
//         .send()
//         .expect(200)
// })

// test('Should not add if duplicate department', async () => {
//     await new Department(newDepartment).save()
//     const response = await request(app).get('/settings/department/checkDuplicatedepartment?departmentString=BS')
//         .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
//         .send()
//         .expect(400)
// })

test('Update depatment', async () => {
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRETKEY)
    process.env.ADMINTOKEN = token
    admin.token = token

    await new Department(newDepartment).save()
    const modifiedDept = {
        deptId: deptId,
        departmentName: 'Marketing'
    }
    const response = await request(app).patch(`/settings/department/edit`)
        .set('Authorization', `Bearer ${token}`)
        .send(modifiedDept)
        .expect(200)
    const modifiedDept1 = await Department.findOne({ _id: deptId })
    expect(modifiedDept1).not.toBeNull()
    expect(modifiedDept.departmentName).toEqual(modifiedDept1.departmentName)
})

test('Should not update depatment id DeptId is missing', async () => {
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRETKEY)
    process.env.ADMINTOKEN = token
    admin.token = token

    await new Department(newDepartment).save()
    const modifiedDept = {
        departmentName: 'Marketing'
    }
    const response = await request(app).patch(`/settings/department/edit?deptId=`)
        .set('Authorization', `Bearer ${token}`)
        .send(modifiedDept)
        .expect(400)
})

test('Should not update depatment id DeptId is not in data', async () => {
    const token = jwt.sign({ _id: admin._id.toString() }, process.env.JWT_SECRETKEY)
    process.env.ADMINTOKEN = token
    admin.token = token

    await new Department(newDepartment).save()
    const modifiedDept = {
        departmentName: 'Marketing'
    }
    const response = await request(app).patch(`/settings/department/edit?deptId=f16464sdfsdfs`)
        .set('Authorization', `Bearer ${token}`)
        .send(modifiedDept)
        .expect(400)
})

// test('Delete department', async () => {
//     await new Department(newDepartment).save()
//     const response = await request(app).delete(`/settings/department/delete?deptId=${deptId}`)
//         .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
//         .send()
//         .expect(200)
//     const deletedDept = await Department.findOne({ _id: deptId })
//     expect(deletedDept).toBeNull()
// })

// test('Should not delete department if id missing', async () => {
//     await new Department(newDepartment).save()
//     const response = await request(app).delete(`/settings/department/delete?deptId=`)
//         .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
//         .send()
//         .expect(400)
// })