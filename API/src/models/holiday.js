const mongoose = require('mongoose')
const currentyear = new Date().getFullYear()

const holidaySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    })

holidaySchema.statics.findByDate = async (date) => {
    //date.setHours(0,0,0)
    const holiday = await Holiday.findOne({ date, 
        "$expr": { "$eq": [{ "$year": "$date" }, currentyear] } 
    })

    if (!holiday) {
        throw new Error(`Unable to find holiday for ${date}`)
    }
    
    return holiday
}

holidaySchema.pre('save', async function (next) {
    const holiday = this
    //holiday.date.setHours(0,0,0);
    next()
})

const Holiday = mongoose.model('Holiday', holidaySchema)

module.exports = Holiday