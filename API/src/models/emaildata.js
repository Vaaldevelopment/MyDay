const mongoose = require('mongoose')
const validator = require('validator')
const SparkPost = require('sparkpost');
const client = new SparkPost('8716af84deb40599611fabef915f996f9ba97190');

const emailDataSchema = new mongoose.Schema({
    fromId: {
        type: String,
        required: true,
        trim: true
    },
    toId: {
        type: String,
        required: true,
        trim: true
    },
    leaveId: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    emailBody: {
        type: String,
        trim: true,
        required: true
    },
    sendStatus: {
        type: String,
        trim: true,
        required: true
    }
}, {
    timestamps: true
})


emailDataSchema.statics.sentEmail = async (emailSubject, htmlContent, empDetails, empManager, leaveDetails, loginUser) => {
    client.transmissions.send({
        // options: {
        //   sandbox: true
        // },
        content: {
            from: 'webdeveloper@vaal-triangle.com',
            subject: emailSubject,
            html: '<html><body>' + htmlContent + '</body></html>'
            // headers: {
            //     CC: "hr@vaal-triangle.com"
            //   },
        },
        recipients: [
            //{ address: empManager.email },
            { address: empDetails.email }
            // {
            //     address: {
            //         "email": "hr@vaal-triangle.com",
            //         "header_to": empManager.email
            //       }
            //   }
        ]
    })
        .then(data => {
            const addEmailDetails = new EmailData()
            if (empManager._id == loginUser) {
                addEmailDetails.fromId = empManager._id;
                addEmailDetails.toId = empDetails._id;
            } else {
                addEmailDetails.fromId = empDetails._id;
                addEmailDetails.toId = empManager._id;
            }

            addEmailDetails.leaveId = leaveDetails._id;
            addEmailDetails.subject = emailSubject
            addEmailDetails.emailBody = htmlContent
            addEmailDetails.sendStatus = true
            addEmailDetails.save()
            console.log('EmailData Save');
            // console.log(data);
            // console.log(empManager.email);
            // console.log(empDetails.email);
        })
        .catch(err => {
            console.log('Whoops! Something went wrong');
            console.log(err);
            return false;
        });

    return true;
}
const EmailData = mongoose.model('EmailData', emailDataSchema)
module.exports = EmailData