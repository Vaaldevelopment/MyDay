const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const Holiday = require('../src/models/holiday')
const User = require('../src/models/user')
const auth = require('../src/middleware/auth')
const today = new Date()
const currentYear = today.getFullYear()

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
    dateOfJoining: currentYear + '-06-27T06:17:07.654Z',
    tokens: [{
        token: jwt.sign({ _id: hrId }, process.env.JWT_SECRETKEY)
    }]
}

const testHoliday = {
    date: new Date(currentYear + '-11-05'),
    description: 'Holiday'
}

beforeEach(async () => {
    await User.deleteMany()
    await Holiday.deleteMany()
    await new User(hrUser).save()
    await new Holiday(testHoliday).save()
})

test('Add holiday', async () => {
    const newHoliday = {
        date: new Date(currentYear + '-08-15'),
        description: 'Independence Day'
    }
    const response = await request(app)
        .post('/hr/holiday/add')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(newHoliday)
        .expect(201)

    expect(response.body.holiday.description).toEqual(newHoliday.description)
    expect(new Date(response.body.holiday.date)).toEqual(newHoliday.date)
})

test('Should not add holiday if date is invalid', async () => {
    const newHoliday = {
        date: new Date(currentYear + '-13-15'),
        description: 'Independence Day'
    }

    const response = await request(app)
        .post('/hr/holiday/add')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(newHoliday)
        .expect(400)

})

test('Should not add holiday if description is empty', async () => {
    const newHoliday = {
        date: new Date(currentYear + '-08-15'),
        description: ''
    }
    const response = await request(app)
        .post('/hr/holiday/add')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(newHoliday)
        .expect(400)

})

test('Update holiday', async () => {

    const updateHoliday = {
        date: new Date(currentYear + '-08-15'),
        description: 'India Independence Day'
    }
    await new Holiday(updateHoliday).save()

    updateHoliday.description = 'Independence day'

    const response = await request(app)
        .patch('/hr/holiday/update')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(updateHoliday)
        .expect(200)

    expect(response.body.holiday.description).toEqual(updateHoliday.description)
    expect(new Date(response.body.holiday.date)).toEqual(updateHoliday.date)
})

test('Should not Update holiday if description is missing', async () => {

    const updateHoliday = {
        date: new Date(currentYear + '-08-15'),
        description: 'India Independence Day'
    }
    await new Holiday(updateHoliday).save()

    updateHoliday.description = ''

    const response = await request(app)
        .patch('/hr/holiday/update')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send(updateHoliday)
        .expect(400)
})

test('Delete holiday', async () => {

    const holiday = {
        date: new Date(currentYear + '-08-15'),
        description: 'India Independence Day'
    }
    await new Holiday(holiday).save()

    const response = await request(app)
        .delete('/hr/holiday/delete?date=2019-08-15')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send()
        .expect(200)

    const getHoliday = await Holiday.findOne({ date: holiday.date })
    expect(getHoliday).toBeNull()
})

test('Should not Delete holiday that does not exist', async () => {

    const holiday = {
        date: new Date(currentYear + '-08-15'),
        description: 'India Independence Day'
    }
    await new Holiday(holiday).save()

    const response = await request(app)
        .delete('/hr/holiday/delete?date=2019-09-15')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send()
        .expect(400)
})

test('List Holidays', async () => {

    const holiday1 = {
        date: new Date(currentYear + '-01-26'),
        description: 'India Republic Day'
    }

    const holiday2 = {
        date: new Date(currentYear + '-08-15'),
        description: 'India Independence Day'
    }

    const holiday3 = {
        date: new Date(currentYear + '-10-02'),
        description: 'Gandhi Jayanti'
    }

    const holiday4 = {
        date: new Date(currentYear + '-10-28'),
        description: 'Diwali'
    }
    const holiday5 = {
        date: new Date(currentYear + '-11-18'),
        description: 'Holiday 2'
    }
    await new Holiday(holiday1).save()
    await new Holiday(holiday2).save()
    await new Holiday(holiday3).save()
    await new Holiday(holiday4).save()
    await new Holiday(holiday5).save()

    const response = await request(app)
        .get('/hr/holiday/list')
        .set('Authorization', `Bearer ${hrUser.tokens[0].token}`)
        .send()
        .expect(200)
    const arrayholidayList = response.body.holidays
    expect(arrayholidayList.length).toBe(6)
    const responseHoliday1 = response.body.holidays[0]

    expect(new Date(responseHoliday1.date)).toEqual(holiday1.date)
    expect(responseHoliday1.description).toEqual(holiday1.description)

    const responseHoliday2 = response.body.holidays[1]
    expect(new Date(responseHoliday2.date)).toEqual(holiday2.date)
    expect(responseHoliday2.description).toEqual(holiday2.description)
})