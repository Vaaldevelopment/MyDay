const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const jwt = require('jsonwebtoken')
const adminRouter = require('./routers/admin')
const hrRouter = require('./routers/hr')
const holidayRouter = require('./routers/holiday')
const leaveRouter = require('./routers/leave')
const managerRouter = require('./routers/manager')

const app = express()


//const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
var cors = require('cors');

app.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT,POST,GET');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});
app.use(cors());
// API file for interacting with MongoDB
//const api = require('./db/mongoose');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
// Parsers

app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({ limit: '16mb' }));
// Angular DIST output folder
//app.use(express.static(path.join(__dirname, 'dist')));
//app.use(express.static(path.join(__dirname, 'src')));

// API location
//app.use('/api', api);

// Send all other requests to the Angular app
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
//     //res.sendFile(path.join(__dirname, 'dist/index.html'));
// });

//Set Port
const port = process.env.PORT
app.set('port', port);

const server = http.createServer(app);

app.use(express.json())
app.use(userRouter)
app.use(adminRouter)
app.use(hrRouter)
app.use(holidayRouter)
app.use(leaveRouter)
app.use(managerRouter)
module.exports = app

//ToDo - All responses should be in standard format {error: error, data: data}