const mongoose = require('mongoose');
const validator = require('validator');


const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        trim: true
    },
}, {
        timestamps: true
    })

    departmentSchema.statics.departmentList = async () => {
        const departmentList = await Department.find().sort({ departmentName: 1 })
        return departmentList
    }


const Department = mongoose.model('Department', departmentSchema)
module.exports = Department