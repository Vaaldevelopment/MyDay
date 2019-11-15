const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')
const Leave = require('../src/models/leave')
const today = new Date()
const currentYear = today.getFullYear()

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
    dateOfJoining: currentYear + '-06-27T06:17:07.654Z',
    EL: 20,
    CL: 5,
    tokens: [{
        token: jwt.sign({ _id: userId }, process.env.JWT_SECRETKEY)
    }]
}



const leaveApplication1 = {
    employeeId: userId,
    reason: "Travelling",
    fromDate: currentYear + "-12-11",
    toDate: currentYear + "-12-11",
    leaveType: "CL",
    leavePlanned: true,
    fromSpan: "FIRST HALF",
    toSpan: "FIRST HALF"
}


const leaveApplication2 = {
    employeeId: userId,
    reason: "Travelling",
    fromDate: currentYear + "-12-12",
    toDate: currentYear + "-12-12",
    leaveType: "CL",
    leavePlanned: true,
    fromSpan: "SECOND HALF",
    toSpan: "SECOND HALF"
}


const leaveApplication3 = {
    employeeId: userId,
    reason: "PTO",
    fromDate: currentYear + "-12-20",
    toDate: currentYear + "-12-25",
    leaveType: "CL",
    leavePlanned: false,
    fromSpan: "FULL DAY",
    toSpan: "FULL DAY"
}

const leaveApplicationA = {
    employeeId: userId,
    reason: "PTO",
    fromDate: currentYear + "-11-1",
    toDate: currentYear + "-11-4",
    leaveType: "CL",
    leavePlanned: false,
    fromSpan: "FULL DAY",
    toSpan: "FIRST HALF"
}

const leaveApplicationB = {
    employeeId: userId,
    reason: "PTO",
    fromDate: currentYear + "-11-14",
    toDate: currentYear + "-11-15",
    leaveType: "CL",
    leavePlanned: false,
    fromSpan: "SECOND HALF",
    toSpan: "FULL DAY"
}

const leaveApplicationC = {
    employeeId: userId,
    reason: "PTO",
    fromDate: currentYear + "-11-26",
    toDate: currentYear + "-11-27",
    leaveType: "CL",
    leavePlanned: false,
    fromSpan: "SECOND HALF",
    toSpan: "FIRST HALF"
}

beforeEach(async () => {
    await User.deleteMany()
    await Leave.deleteMany()
    await new User(user).save()
    await new Leave(leaveApplication1).save()
    await new Leave(leaveApplication2).save()
    await new Leave(leaveApplication3).save()
    await new Leave(leaveApplicationA).save()
    await new Leave(leaveApplicationB).save()
    await new Leave(leaveApplicationC).save()
})

test('User apply for leave single first half day', async () => {
    // Single First half 
    const leaveApplicationFir = {
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-12-13",
        toDate: currentYear + "-12-13",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FIRST HALF",
        toSpan: "FIRST HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationFir)
        .expect(201)

    const leave = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationFir.fromDate, toDate: leaveApplicationFir.toDate })
    //half day condition
    expect(leave).not.toBeNull()
    expect(leave.reason).toEqual(leaveApplicationFir.reason)
    expect(new Date(leave.fromDate)).toEqual(new Date(leaveApplicationFir.fromDate))
    expect(new Date(leave.toDate)).toEqual(new Date(leaveApplicationFir.toDate))
})

test('User apply for leave single second half day', async () => {
    // Single First half 
    const leaveApplicationSec = {
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-12-13",
        toDate: currentYear + "-12-13",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "SECOND HALF",
        toSpan: "SECOND HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSec)
        .expect(201)

    const leave = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationSec.fromDate, toDate: leaveApplicationSec.toDate })
    expect(leave).not.toBeNull()
    expect(leave.reason).toEqual(leaveApplicationSec.reason)
    expect(new Date(leave.fromDate)).toEqual(new Date(leaveApplicationSec.fromDate))
    expect(new Date(leave.toDate)).toEqual(new Date(leaveApplicationSec.toDate))
})

test('User apply for leave single half day overlap no conflict', async () => {
    //ref leaveApplication1
    const leaveApplicationFirst = {
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-12-11",
        toDate: currentYear + "-12-11",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "SECOND HALF",
        toSpan: "SECOND HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationFirst)
        .expect(201)

    const leaveApplicationSecond = {
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-12-12",
        toDate: currentYear + "-12-12",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FIRST HALF",
        toSpan: "FIRST HALF"
    }

    const response1 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSecond)
        .expect(201)

})

test('Should not apply for leave single half day overlap conflict', async () => {
    //ref leaveApplication2
    const leaveApplicationFirst = {
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-12-11",
        toDate: currentYear + "-12-11",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FIRST HALF",
        toSpan: "FIRST HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationFirst)
        .expect(400)

    const leaveApplicationSecond = {
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-12-12",
        toDate: currentYear + "-12-12",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "SECOND HALF",
        toSpan: "SECOND HALF"
    }

    const response1 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSecond)
        .expect(400)

})

test('Should not apply for leave single half day overlap full Day', async () => {
    //ref leaveApplication3
    const leaveApplicationFirst = {
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-12-20",
        toDate: currentYear + "-12-20",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FIRST HALF",
        toSpan: "FIRST HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationFirst)
        .expect(400)

    const leaveApplicationSecond = {
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-12-22",
        toDate: currentYear + "-12-22",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "SECOND HALF",
        toSpan: "SECOND HALF"
    }

    const response1 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSecond)
        .expect(400)

})

// No overlap for ABC
test('User apply for leave single half day, no overlap holiday + weekend ', async () => {
    //ref leaveApplication3
    const leaveApplicationHolidayWeekend = {
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-10-25",
        toDate: currentYear + "-10-30",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "FULL DAY",
        toSpan: "FIRST HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationHolidayWeekend)
        .expect(201)

    const leaveHolidayWeekend = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationHolidayWeekend.fromDate, toDate: leaveApplicationHolidayWeekend.toDate })
    expect(leaveHolidayWeekend).not.toBeNull()

})

test('User apply for leave single half day, no overlap sandwich ', async () => {
    //ref leaveApplication3
    const leaveApplicationSandwich = {
        employeeId: userId,
        reason: "Travelling",
        fromDate: currentYear + "-10-25",
        toDate: currentYear + "-11-7",
        leaveType: "CL",
        leavePlanned: true,
        fromSpan: "SECOND HALF",
        toSpan: "FIRST HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSandwich)
        .expect(201)

    const leaveHolidaySandwich = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationSandwich.fromDate, toDate: leaveApplicationSandwich.toDate })
    expect(leaveHolidaySandwich).not.toBeNull()

})

// Overlap A (PASS)
// SEC HALF Single, Ref leaveApplicationA
test('User apply for leave, overlap leaveApplicationA', async () => {
    const leaveApplicationSingleHD = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-4",
        toDate: currentYear + "-11-4",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "SECOND HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSingleHD)
        .expect(201)

    const leaveHolidaySingleHD = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationSingleHD.fromDate, toDate: leaveApplicationSingleHD.toDate })
    expect(leaveHolidaySingleHD).not.toBeNull()

})
// Start = SEC HALF & End = FIRST HALF & Holiday + Weekend, Ref leaveApplicationA
test('User apply for leave,overlap leaveApplicationA holiday weekend', async () => {
    const leaveApplicationSshEfh = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-4",
        toDate: currentYear + "-11-11",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FIRST HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSshEfh)
        .expect(201)

    const leaveHolidaySshEfh = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationSshEfh.fromDate, toDate: leaveApplicationSshEfh.toDate })
    expect(leaveHolidaySshEfh).not.toBeNull()

})
// Start = SEC HALF & End = FULL DAY & Sandwich, Ref leaveApplicationA
test('User apply for leave,overlap leaveApplicationA Sandwich', async () => {
    const leaveApplicationSshEfh = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-4",
        toDate: currentYear + "-11-13",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FULL DAY"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSshEfh)
        .expect(201)

    const leaveHolidaySshEfh = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationSshEfh.fromDate, toDate: leaveApplicationSshEfh.toDate })
    expect(leaveHolidaySshEfh).not.toBeNull()

})

// Overlap B (PASS)
// SEC HALF Single, Ref leaveApplicationB
test('User apply for leave, overlap leaveApplicationB', async () => {
    const leaveApplicationShdEhd = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-14",
        toDate: currentYear + "-11-14",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "FIRST HALF",
        toSpan: "FIRST HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationShdEhd)
        .expect(201)

    const leaveHolidayshdEhd = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationShdEhd.fromDate, toDate: leaveApplicationShdEhd.toDate })
    expect(leaveHolidayshdEhd).not.toBeNull()

})
// Start = FULL DAY & End = FIRST HALF & Holiday + Weekend, Ref leaveApplicationB
test('User apply for leave,overlap leaveApplicationB holiday weekend', async () => {
    const leaveApplicationSfdEfh = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-8",
        toDate: currentYear + "-11-14",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "FULL DAY",
        toSpan: "FIRST HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSfdEfh)
        .expect(201)

    const leaveHolidaySfdEsh = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationSfdEfh.fromDate, toDate: leaveApplicationSfdEfh.toDate })
    expect(leaveHolidaySfdEsh).not.toBeNull()

})
// Start = SECOND HALF & End = FIRST HALF & Sandwich, Ref leaveApplicationB
test('User apply for leave,overlap leaveApplicationB Sandwich', async () => {
    const leaveApplicationSshEfh = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-8",
        toDate: currentYear + "-11-19",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FIRST HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSshEfh)
        .expect(201)

    const leaveHolidaySshEfh = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationSshEfh.fromDate, toDate: leaveApplicationSshEfh.toDate })
    expect(leaveHolidaySshEfh).not.toBeNull()

})

// Overlap C (PASS)
// FIRST HALF Single, Ref leaveApplicationC
test('User apply for single first half leave, overlap leaveApplicationC', async () => {
    const leaveApplicationSfhEfh = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-26",
        toDate: currentYear + "-11-26",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "FIRST HALF",
        toSpan: "FIRST HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSfhEfh)
        .expect(201)

    const leaveHolidaySfhEfh = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationSfhEfh.fromDate, toDate: leaveApplicationSfhEfh.toDate })
    expect(leaveHolidaySfhEfh).not.toBeNull()

})
// SECOND HALF Single, Ref leaveApplicationC
test('User apply for single second half leave, overlap leaveApplicationC', async () => {
    const leaveApplicationSshEsh = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-27",
        toDate: currentYear + "-11-27",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "SECOND HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSshEsh)
        .expect(201)

    const leaveHolidaySshEsh = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationSshEsh.fromDate, toDate: leaveApplicationSshEsh.toDate })
    expect(leaveHolidaySshEsh).not.toBeNull()

})

// Start = FULL DAY & End = FIRST HALF , Ref leaveApplicationC (Past)
test('User apply for full day & first half leave, overlap leaveApplicationC', async () => {
    const leaveApplicationSfdEfh = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-25",
        toDate: currentYear + "-11-26",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "FULL DAY",
        toSpan: "FIRST HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSfdEfh)
        .expect(201)

    const leaveHolidaySfdEfh = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationSfdEfh.fromDate, toDate: leaveApplicationSfdEfh.toDate })
    expect(leaveHolidaySfdEfh).not.toBeNull()

})

// Start = SECOND HALF & End = FIRST HALF , Ref leaveApplicationC (Past)
test('User apply for second half & first half leave, overlap leaveApplicationC, Past', async () => {
    const leaveApplicationSshEfhPast = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-25",
        toDate: currentYear + "-11-26",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FIRST HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSshEfhPast)
        .expect(201)

    const leaveHolidaySshEfhPast = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationSshEfhPast.fromDate, toDate: leaveApplicationSshEfhPast.toDate })
    expect(leaveHolidaySshEfhPast).not.toBeNull()

})
// Start = SECOND HALF & End = FULL DAY , Ref leaveApplicationC (Future)
test('User apply for second half & full day leave, overlap leaveApplicationC, Future', async () => {
    const leaveApplicationSshEfd = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-27",
        toDate: currentYear + "-11-28",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FULL DAY"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSshEfd)
        .expect(201)

    const leaveHolidaySshEfd = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationSshEfd.fromDate, toDate: leaveApplicationSshEfd.toDate })
    expect(leaveHolidaySshEfd).not.toBeNull()

})
// Start = SECOND HALF & End = FIRST HALF , Ref leaveApplicationC (Future)
test('User apply for second half & first half leave, overlap leaveApplicationC, Future', async () => {
    const leaveApplicationSshEfhFuture = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-27",
        toDate: currentYear + "-11-28",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FIRST HALF"
    }
    const logUser = await User.findById(userId)
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationSshEfhFuture)
        .expect(201)

    const leaveHolidaySshEfhFuture = await Leave.findOne({ employeeId: userId, fromDate: leaveApplicationSshEfhFuture.fromDate, toDate: leaveApplicationSshEfhFuture.toDate })
    expect(leaveHolidaySshEfhFuture).not.toBeNull()

})

// OverLap Fail Test Case for ABC
//Full Day
//Start = Full Day 
test('Should not apply for Start full day leave, overlap fail ABC', async () => {
    const leaveApplicationOverLapFailA = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-1",
        toDate: currentYear + "-11-4",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "FULL DAY",
        toSpan: "SECOND HALF"
    }

    const logUser = await User.findById(userId)

    const response1 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailA)
        .expect(400)

    const leaveApplicationOverLapFailB = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-14",
        toDate: currentYear + "-11-15",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "FULL DAY",
        toSpan: "FIRST HALF"
    }
    const response2 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailB)
        .expect(400)

    const leaveApplicationOverLapFailC = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-26",
        toDate: currentYear + "-11-27",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "FULL DAY",
        toSpan: "SECOND HALF"
    }
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailC)
        .expect(400)

})

//END = Full Day 
test('Should not apply for End full day leave, overlap fail ABC', async () => {
    const leaveApplicationOverLapFailA = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-1",
        toDate: currentYear + "-11-4",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FULL DAY"
    }

    const logUser = await User.findById(userId)

    const response1 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailA)
        .expect(400)

    const leaveApplicationOverLapFailB = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-14",
        toDate: currentYear + "-11-15",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "FIRST HALF",
        toSpan: "FULL DAY"
    }
    const response2 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailB)
        .expect(400)

    const leaveApplicationOverLapFailC = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-26",
        toDate: currentYear + "-11-27",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FULL DAY"
    }
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailC)
        .expect(400)

})

//Start < Full < End 
test('Should not apply for Start < Full < End leave, overlap fail ABC', async () => {
    const leaveApplicationOverLapFailA = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-1",
        toDate: currentYear + "-11-4",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FIRST HALF"
    }

    const logUser = await User.findById(userId)

    const response1 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailA)
        .expect(400)

    const leaveApplicationOverLapFailB = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-14",
        toDate: currentYear + "-11-15",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FIRST HALF"
    }
    const response2 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailB)
        .expect(400)

    const leaveApplicationOverLapFailC = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-26",
        toDate: currentYear + "-11-27",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FIRST HALF"
    }
    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailC)
        .expect(400)

})

// OverLap Fail Test Case for ABC
//Half Day
//Start first Half
test('Should not apply for Start first Half leave, overlap fail A', async () => {
    const leaveApplicationOverLapFailA = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-1",
        toDate: currentYear + "-11-4",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "FIRST HALF",
        toSpan: "FULL DAY"
    }

    const logUser = await User.findById(userId)

    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailA)
        .expect(400)
})

//END first Half
test('Should not apply for End first Half leave, overlap fail A', async () => {
    const leaveApplicationOverLapFailA = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-1",
        toDate: currentYear + "-11-4",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FIRST HALF"
    }

    const logUser = await User.findById(userId)

    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailA)
        .expect(400)
})

//Start second Half
test('Should not apply for Start second Half leave, overlap fail ABC', async () => {
    const leaveApplicationOverLapFailA = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-1",
        toDate: currentYear + "-11-4",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FULL DAY"
    }

    const logUser = await User.findById(userId)

    const response = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailA)
        .expect(400)

    const leaveApplicationOverLapFailB = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-14",
        toDate: currentYear + "-11-15",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FIRST HALF"
    }

    const response1 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailB)
        .expect(400)

    const leaveApplicationOverLapFailC = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-26",
        toDate: currentYear + "-11-27",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FIRST HALF"
    }

    const response2 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailC)
        .expect(400)
})

//End Second Half
test('Should not apply for End Second half leave, overlap fail, BC', async () => {

    const logUser = await User.findById(userId)

    const leaveApplicationOverLapFailB = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-14",
        toDate: currentYear + "-11-15",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "FULL DAY",
        toSpan: "FIRST HALF"
    }

    const response1 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailB)
        .expect(400)

    const leaveApplicationOverLapFailC = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-11-26",
        toDate: currentYear + "-11-27",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "SECOND HALF",
        toSpan: "FIRST HALF"
    }

    const response2 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailC)
        .expect(400)
})

//Multiple Leave
//ref leaveApplication3
//Start = END of leaveApplication3
test('Should not apply for Start = END of leaveApplication3, overlap fail', async () => {

    const logUser = await User.findById(userId)

    const leaveApplicationOverLapFailB = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-12-23",
        toDate: currentYear + "-12-25",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "FULL DAY",
        toSpan: "FIRST HALF"
    }

    const response1 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailB)
        .expect(400)
})

//END = Start of leaveApplication3
test('Should not apply for END = Start of leaveApplication3, overlap fail', async () => {

    const logUser = await User.findById(userId)

    const leaveApplicationOverLapFailB = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-12-25",
        toDate: currentYear + "-12-27",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "FULL DAY",
        toSpan: "FULL DAY"
    }

    const response1 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailB)
        .expect(400)
})

//START < (Between  of leaveApplication3) < END = Start of leaveApplication3
test('Should not apply for END = Start of leaveApplication3, overlap fail', async () => {

    const logUser = await User.findById(userId)

    const leaveApplicationOverLapFailB = {
        employeeId: userId,
        reason: "PTO",
        fromDate: currentYear + "-12-23",
        toDate: currentYear + "-12-24",
        leaveType: "CL",
        leavePlanned: false,
        fromSpan: "FULL DAY",
        toSpan: "FIRST HALF"
    }

    const response1 = await request(app).post('/user/leave/apply')
        .set('Authorization', `Bearer ${logUser.tokens[0].token}`)
        .send(leaveApplicationOverLapFailB)
        .expect(400)
})