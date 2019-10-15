const User = require('../models/user')
const mongoose = require('mongoose')
const currentYear = new Date().getFullYear()

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true
    },
    inDate: {
        type: Date,
        required: true
    },
    outDate: {
        type: Date,
    },
    inTime: {
        type: Number,
        required: true
    },
    outTime: {
        type: Number,
        required: true
    }
},
    {
        timestamps: true
    })

//To Do - Fetch for only current month
attendanceSchema.statics.getAttendance = async (employeeId) => {
    const attendance = await Attendance.find({ employeeId: employeeId, "$expr": { "$eq": [{ "$year": "$inDate" }, currentYear] } }).sort({ inDate: 1 })
    if (!attendance) {
        throw new Error(`Attendance Empty`)
    }
    return attendance
}

attendanceSchema.statics.addAttendance = async (reqAttendanceDate) => {
    const existingDate = await Attendance.findOne({ $and: [{ inDate: reqAttendanceDate.inDate }, { employeeId: reqAttendanceDate.employeeCode }] })
    if (existingDate) {
        throw new Error(`Attendeance already exists for Employee ${reqAttendanceDate.employeeId} for date ${reqAttendanceDate.inDate}`)
    }
    const attendance = await new Attendance(reqAttendanceDate).save()
    return attendance
}

attendanceSchema.statics.updateAttendance = async (reqUpdateAttendanceData) => {

    const attendance = await new Attendance(reqUpdateAttendanceData).save()
    return attendance
}

attendanceSchema.statics.deleteAttendance = async (reqDeleteAttendanceData) => {
    const existingAttendance = await Attendance.findOne({ _id: reqDeleteAttendanceData._id })

    if (!existingAttendance) {
        throw new Error(`Attendance does not exist for date`)
    }
    const attendance = await new Attendance(reqDeleteAttendanceData)
    await attendance.remove()
}

attendanceSchema.statics.isManagerOf = async (manager, user) => {
    const countManager = await User.countDocuments({ managerEmployeeCode: manager })
    if (countManager == 0) {
        throw new Error('User is not manager')
    }
    if (manager == user) {
        return true
    }
    else {
        const descendants = []
        const stack = [];
        const item = await User.findOne({ _id: manager })
        stack.push(item)

        while (stack.length > 0) {
            var currentnode = stack.pop()
            var children = await User.find({ managerEmployeeCode: { $in: currentnode._id } })
            children.forEach(child => {
                descendants.push(child)
                stack.push(child);
            });
        }
        let filterArray = descendants.filter(m => m._id == user)
        if (filterArray != 0) {
            return checkManager = true
        } else {
            return checkManager = false
        }

    }
}
const Attendance = mongoose.model('Attendance', attendanceSchema)

module.exports = Attendance