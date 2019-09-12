const request = require("supertest")
const jwt = require("jasonwebtoken")
const mongoose = require("mongoose")
const app = require("../src/app")
const User = require("../src/models/user")
const Attendance = require("../src/models/attendance")
const auth = require("../src/middleware/auth")

const hrId = new mongoose.Types.ObjectId()

const hrUser = {
    _id: hrId,
    employeeCode: 'VT_005',
    firstName: 'HR',
    lastName: 'HR',
    password: 'Hr@123',
    email: 'hr@vaal-triangle.com',
    managerEmployeeCode: 'VT_001',
    isHR: true,
    department: 'CAD/CAM',
    employeeStatus: 'Permanent',
    dateOfJoining: '2020-06-27T06:17:07.654Z',
    tokens: [{
        token: jwt.sign({ _id: hrId }, process.env.JWT_SECRETKEY)
    }]
}

test('Add holiday', async() => {
    const newAttendance = {
        employeeCode: 'VT_001',
        inDate: new Date('2019-09-11'),
        inTime: '0930',
        outTime: '2130',
    }
    const response = await request(app)
        .post('hr/attendance/add')
        .set('Authorization',`Bearer ${hrUser.tokens[0].token}`)
        .send(newAttendance)
        .expect(200)
    
    expect(response.body.employeeCode).toEqual(newAttendance.employeeCode)
    expect(response.body.inDate).toEqual(newAttendance.inDate)
    expect(response.body.inTime).toEqual(newAttendance.inTime)
    expect(response.body.outTime).toEqual(newAttendance.outTime)
})