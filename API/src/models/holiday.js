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
    const holiday = await Holiday.findOne({
        date,
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

holidaySchema.statics.getHolidayList = async (year) => {

    let holidaylist = []
    if (!year) {
        holidaylist = await Holiday.find().sort({ date: 1 })
    }
    else {
        year = new Date(year).getFullYear()
        holidaylist = await Holiday.find({ "$expr": { "$eq": [{ "$year": "$date" }, year] } }).sort({ date: 1 })
    }

    if (!holidaylist) {
        throw new Error('Holiday List Empty')
    }
    return holidaylist
}

holidaySchema.statics.addHoliday = async (reqHolidayData) => {
    const existingHoliday = await Holiday.findOne({ date: reqHolidayData.date, "$expr": { "$eq": [{ "$year": "$date" }, currentyear] } })
    if (existingHoliday) {
        throw new Error(`Holiday already exist for date ${reqHolidayData.date}`)
    }
    reqHolidayData._id = undefined
    const holiday = await new Holiday(reqHolidayData).save()
    return holiday
}

holidaySchema.statics.updateHoliday = async (reqUpdateHolidayData) => {
    const existingHoliday = await Holiday.findOne({ date: reqUpdateHolidayData.date, "$expr": { "$eq": [{ "$year": "$date" }, currentyear] } })

    if (!existingHoliday) {
        throw new Error(`Holiday does not exist for date ${reqUpdateHolidayData.date}`)
    }

    existingHoliday.description = reqUpdateHolidayData.description
    await existingHoliday.save()
    return existingHoliday
}

holidaySchema.statics.deleteHoliday = async (reqDeleteHolidayData) => {

    const existingHoliday = await Holiday.findOne({ date: reqDeleteHolidayData })
    //"$expr": { "$eq": [{ "$year": "$date" }, currentyear] }
    if (!existingHoliday) {
        throw new Error(`Holiday does not exist for date ${reqDeleteHolidayData}`)
    }
    await existingHoliday.remove()
}

const Holiday = mongoose.model('Holiday', holidaySchema)

module.exports = Holiday