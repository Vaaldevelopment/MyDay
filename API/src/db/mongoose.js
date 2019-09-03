const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);

mongoose.connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useCreateIndex: true
})