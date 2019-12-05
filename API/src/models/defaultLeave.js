const mongoose = require('mongoose');
const validator = require('validator');


const defaultLeavesSchema = new mongoose.Schema({
    casualLeaves: {
        type: Number,
        required: true,
    },
    earnedLeaves: {
        type: Number,
        required: true,
    },
    maternityLeaves: {
        type: Number,
        // required: true,
    },
    year:{
        type: String,
        trim: true
    }
}, {
        timestamps: true
    })

const DefaultLeaves = mongoose.model('DefaultLeave', defaultLeavesSchema)
module.exports = DefaultLeaves