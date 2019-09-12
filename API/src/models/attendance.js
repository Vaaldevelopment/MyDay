const mongoose = require('mongoose')
const currentYear = new Date().getFullYear()

const attendanceSchema = new mongoose.Schema({
    
    employeeCode:{
        type: String,
        required: true
    },
    inDate:{
        type: Date,
        required: true
    },
    outDate:{
        type: Date,
    },
    inTime:{
        type: Number,
        required: true
    },
    outTime:{
        type: Number,
        required: true
    }
},
{
    timestamps: true
})

//To Do - Fetch for only current month
attendanceSchema.statics.getAttendance = async (employeeCode) => {    
    if(employeeCode){
        const attendance = await Attendance.find({ 
            $and:[
                {employeeId: employeeId},
                {"$expr" : {"$eq": [{ "$year": "$inDate" }, currentYear]}}
            ]
        }).sort({inDate: 1})
        if(!attendance){
            throw new Error(`Attendance Empty`)
        }
        return attendance
    }else{
        const attendance = await Attendance.find({"$expr": {"$eq": [{"$year": "$inDate" }, currentYear]}}).sort({inDate: 1})
        if(!attendance){
            throw new Error(`Attendance Empty`)
        }
        return attendance
    }
    
}

attendanceSchema.statics.addAttendance = async (reqAttendanceDate) => {
    const existingDate =  await Attendance.findOne({$and:[{ inDate: reqAttendanceDate.inDate},{employeeCode:reqAttendanceDate.employeeCode}]})
    if(existingDate){
        throw new Error(`Attendeance already exists for Employee ${reqAttendanceDate.employeeId} for date ${reqAttendanceDate.inDate}`)
    }
    const attendance = await new Attendance(reqAttendanceDate).save()
    return attendance
}

attendanceSchema.statics.updateAttendance = async (reqUpdateAttendanceData) => {
    // const existingAttendance = await Attendance.findOne({ _id: reqUpdateAttendanceData._id.toString()})
    // existingAttendance.outDate = reqUpdateAttendanceData.outDate
    // existingAttendance.inTime = reqUpdateAttendanceData.inTime
    // existingAttendance.outTime = reqUpdateAttendanceData.outTime
    const attendance = await new Attendance(reqUpdateAttendanceData).save()
    return attendance
}

attendanceSchema.statics.deleteAttendance = async (reqDeleteAttendanceData) => {
    const existingAttendance = await Attendance.findOne({ _id: reqDeleteAttendanceData._id})

    if (!existingAttendance) {
        throw new Error(`Attendance does not exist for date`)
    }
    const attendance = await new Attendance(reqDeleteAttendanceData)
    await attendance.remove()
}

const Attendance = mongoose.model('Attendance', attendanceSchema)

module.exports = Attendance