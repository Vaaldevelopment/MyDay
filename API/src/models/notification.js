const mongoose = require('mongoose')
const validator = require('validator')

const notificatioSchema = new mongoose.Schema({
    fromId : {
        type: String,
        required: true,
        trim: true
    },
    toId: {
        type: String,
        required: true,
        trim: true
    },
    leaveId :{
        type: String,
        required: true,
        trim: true
    },
    notificationStatus: {
        type: String,
        trim: true,
        required: true
    },
    isRead: {
        type:Boolean,
        default: false
    }
},{
    timestamps: true
})


// notificatioSchema.function = async () => {

// }
const Notification = mongoose.model('Notification', notificatioSchema)
module.exports = Notification