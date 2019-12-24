const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const LeaveData = require('../models/leavedata')
const DefaultLeave = require('../models/defaultLeave')
const Holiday = require ('../models/holiday')
const currentyear = new Date().getFullYear()

const userSchema = new mongoose.Schema({
    employeeCode: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    managerEmployeeCode: {
        type: String,
        required: true,
        trim: true,
    },
    isHR: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email-Id is invalid')
            }
        }
    },
    dateOfJoining: {
        type: Date,
        // validate(value) {
        //     var selectedDate = new Date(value)
        //     var now = new Date()
        //     if (selectedDate < now) {
        //         throw new Error("Date must be in the future");
        //     }
        // },
        required: true
        //add validation: should not be a future date
    },
    leavingDate: {
        type: Date
        // validate(value) {
        //     var selectedDate = new Date(value)
        //     var now = new Date()
        //     if (selectedDate < now) {
        //         throw new Error("Date must be in the future");
        //     }
        // }
    },
    resignationDate: {
        type: Date
        // validate(value) {
        //     var selectedDate = new Date(value)
        //     var now = new Date()
        //     if (selectedDate < now) {
        //         throw new Error("Date must be in the future");
        //     }
        // }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(value) {
            var regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
            if (!regex.test(value)) {
                throw new Error('Password must contain at least one number, one lowercase and one uppercase letter, at least six characters')
            }
        }
    },
    department: {
        type: String,
        required: true
    },
    employeeType: {
        type: String
        //required: true
    },
    employeeStatus: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        minlength: 10,
        maxlength: 10
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRETKEY)

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Email address not found')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Password is wrong')
    }
    return user
}

userSchema.statics.findByEmail = async (email) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('User not found')
    }
    return user
}

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.statics.userList = async () => {
    const users = await User.find().sort({ employeeCode: 1 })
    return users
}

userSchema.statics.userLeaveCurrentYear = async () => {
    const userLeave = await LeaveData.find({ year: currentyear })
    return userLeave
}

userSchema.statics.checkDuplicate = async (employeeCode) => {
    const user = await User.findOne({ employeeCode })
    return user
}

userSchema.statics.createUser = async (reqUserData) => {
    // if(reqUserData.employeeStatus == "Confirmed" || reqUserData.employeeStatus == "Probationary"){
    //     var joiningDate = reqUserData.dateOfJoining
    //     var joiningMonth = new Date(joiningDate).getMonth()+1
    //     var joiningYear = new Date(joiningDate).getFullYear()
    //     const getDefaultLeave = await DefaultLeave.find()

    //     var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    //     var fromDate = new Date(reqUserData.dateOfJoining);
    //     console.log('fromDate'+fromDate)
    //     var toDate = new Date(joiningYear, joiningMonth, 0);
    //     console.log('toDate'+toDate)
    //     let nLeaveDays = 1 + Math.round(Math.abs((fromDate.getTime() - toDate.getTime()) / (oneDay)));
    
    //     let nsaturdays = Math.floor((fromDate.getDay() + nLeaveDays) / 7);
    //     let nWeekends = 2 * nsaturdays + (fromDate.getDay() == 0) - (toDate.getDay() == 6);
    //     //const holidayList = await Holiday.find({ date: { $gte: new Date() } })
    //     const holidayList = await Holiday.find({"$expr": { "$eq": [{ "$year": "$date" }, joiningYear] }})
    //     console.log(holidayList)
    //     let filterHolidayArray = holidayList.filter(h =>
    //         new Date(h.date).getTime() > fromDate.getTime() && new Date(h.date).getTime() < toDate.getTime())
    //     let nHolidays = filterHolidayArray.length
    //     let leaveSpan = nLeaveDays - nWeekends - nHolidays
    //     console.log(leaveSpan)
    //     if(leaveSpan >= 10){
    //         let calEL = getDefaultLeave.earnedLeaves/(12-joiningMonth)
    //         console.log('calEL' + calEL)
    //         let calCL = getDefaultLeave.casualLeaves/(12-joiningMonth)
    //         console.log('calCL' + calCL)
    //     }
    // }
   
    const newUser = new User(reqUserData)
    await newUser.save()
    return newUser
}

userSchema.statics.updateUser = async (reqUpdateUserData) => {
    if (!reqUpdateUserData._id) {
        throw new Error('EmployeeCode missing')
    }
    const user = await User.findOne({ _id: reqUpdateUserData._id })
    if (!user) {
        throw new Error(`User with employeeCode : ${reqUpdateUserData.employeeCode} not found`)
    }
    if (reqUpdateUserData.password == '') {
        reqUpdateUserData.password = user.password
    }
    const updates = Object.keys(reqUpdateUserData)
    //ToDo- Update Validation Not  working 
    // const allowedUpdates = ['employeeCode', 'firstName']
    // const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    // if (!isValidOperation) {
    //     throw new Error('Invalid updates!')
    // }

    updates.forEach((update) => user[update] = reqUpdateUserData[update])
    await user.save()
    return user
}

userSchema.statics.deleteUser = async (employeeCode) => {
    if (!employeeCode) {
        throw new Error('EmployeeCode missing')
    }
    const user = await User.findOne({ employeeCode })
    if (!user) {
        throw new Error(`User with employeeCode : ${employeeCode} not found`)
    }
    await user.remove()
}
const User = mongoose.model('User', userSchema)
module.exports = User