const request = require("supertest")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const app = require("../src/app")
const User = require("../src/models/user")
const Attendance = require("../src/models/attendance")
const auth = require("../src/middleware/auth")

const hrId = new mongoose.Types.ObjectId()
const empId = new mongoose.Types.ObjectId()

const empId_1 = new mongoose.Types.ObjectId()
const empId_2 = new mongoose.Types.ObjectId()

const hrUser = {
    _id: hrId,
    employeeCode: 'VT_002',
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

beforeEach(async () => {
    await Attendance.deleteMany()
    await User.deleteMany()
    await new User(hrUser).save()
})

test('Add attendance', async () => {
    const newAttendance = {
        employeeId: empId,
        inDate: new Date('2019-09-11'),
        inTime: 930,
        outTime: 2130,
    }
    const response = await request(app)
        .post('/hr/attendance/add')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(newAttendance)
        .expect(201)
    const tempAttendance = await Attendance.findOne({ $and: [{ inDate: newAttendance.inDate }, { employeeCode: newAttendance.employeeCode }] })

    expect(tempAttendance.employeeCode).toEqual(newAttendance.employeeCode)
    expect(new Date(tempAttendance.inDate)).toEqual(new Date(newAttendance.inDate))
    expect(tempAttendance.inTime).toEqual(newAttendance.inTime)
    expect(tempAttendance.outTime).toEqual(newAttendance.outTime)
})

test('Should not add attendance if inDate invalid', async () => {
    const newAttendance = {
        employeeId: empId,
        inDate: new Date('2019-19-11'),
        inTime: 930,
        outTime: 2130,
    }

    const response = await request(app)
        .post('/hr/holiday/add')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(newAttendance)
        .expect(400)
})

test('Should not add attendance if either Date, EmployeeCode, inTime or outTime are empty', async () => {
    const newAttendance = {
        employeeId: '',
        inDate: null,
        inTime: null,
        outTime: null,
    }
    const response = await request(app)
        .post('/hr/attendance/add')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(newAttendance)
        .expect(400)
})

test('Should not update attendance if inTime or outTime are empty', async () => {
    const updateAttendance = {
        employeeId: empId,
        inDate: new Date('2019-9-11'),
        inTime: 930,
        outTime: 2130,
    }
    await new Attendance(updateAttendance).save()
    updateAttendance.inTime = null;

    const response = await request(app)
        .patch('/hr/attendance/update')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(updateAttendance)
        .expect(400)

})

test('Delete Attendance', async () => {
    const attendanceId = new mongoose.Types.ObjectId()
    const attendance = {
        _id: attendanceId,
        employeeId: empId,
        inDate: new Date('2019-09-11'),
        inTime: 930,
        outTime: 2130,
    }
    await new Attendance(attendance).save()

    const response = await request(app)
        .delete(`/hr/attendance/delete?_id=${attendanceId}`)
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send()
        .expect(200)

    const getAttendance = await Attendance.findOne({ $and: [{ inDate: attendance.inDate }, { employeeCode: attendance.employeeCode }] })
    expect(getAttendance).toBeNull()
})


test('List Attendance', async () => {
    const attendance1 = {

        employeeId: empId,
        inDate: new Date('2019-09-11'),
        inTime: 930,
        outTime: 2130,
    }

    const attendance2 ={
        employeeId: empId,
        inDate: new Date('2019-09-12'),
        inTime: 930,
        outTime: 2030,
    }
    const attendance3 ={
        employeeId: empId,
        inDate: new Date('2019-09-13'),

        inTime: 900,
        outTime: 2200,
    }
    await new Attendance(attendance1).save()
    await new Attendance(attendance2).save()
    await new Attendance(attendance3).save()

    const response = await request(app)
        .get(`/hr/attendance/list?employeeId=${empId}`)
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send()

        .expect(200)        
        
        const arrayAttendanceList = response.body.attendance
        expect(arrayAttendanceList.length).toBe(3)  
        

})