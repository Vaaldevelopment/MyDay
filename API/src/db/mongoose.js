const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/leave-management', {
    useNewUrlParser: true,
    useCreateIndex: true
})