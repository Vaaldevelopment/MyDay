const mongoose = require('mongoose')
const validator = require('validator')
// const SparkPost = require('sparkpost');
// const client = new SparkPost('8716af84deb40599611fabef915f996f9ba97190');
const nodemailer = require('nodemailer');

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

    // const transporter = nodemailer.createTransport({
    //     host: 'mailrelay.sigmatek.net',
    //     port: 25,
    //     secure: false
    // });

    // const transporter = nodemailer.createTransport({
    //     host: 'smtp.gmail.com',
    //     port: 465,
    //     secure: true, // use SSL
    //     auth: {
    //         user: 'vess.vaaltriangle@gmail.com',
    //         pass: 'njirrdcujqkgodcg'
    //     }
    // });

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'vess.vaaltriangle@gmail.com',
            pass: 'njirrdcujqkgodcg'
        }
    });

    // send email
    let info = await transporter.sendMail({
        from: 'webdeveloper@vaal-triangle.com',
        to: empDetails.email + ',' + empManager.email,
        cc: 'hr@vaal-triangle.com',
        //to: 'sonali.konge@vaal-triangle.com',
        //to: 'internalinfo@sigmanest.com',
        subject: emailSubject,
        html: '<html><body>' + htmlContent + '</body></html>'
    });



    // send email
    // let info = await transporter.sendMail({
    //     from: 'webdeveloper@vaal-triangle.com',
    //     //to: empDetails.email + ',' + empManager.email,
    //     //cc: 'hr@vaal-triangle.com',
    //     to: 'sonali.konge@vaal-triangle.com',
    //     subject: emailSubject,
    //     html: '<html><body>' + htmlContent + '</body></html>'

    // });

    if (info.messageId) {
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
    }

    //console.log("Message sent: %s", info);
    // client.transmissions.send({
    //     // options: {
    //     //   sandbox: true
    //     // },
    //     content: {
    //         from: 'webdeveloper@vaal-triangle.com',
    //         subject: emailSubject,
    //         html: '<html><body>' + htmlContent + '</body></html>'
    //         // headers: {
    //         //     CC: "hr@vaal-triangle.com"
    //         //   },
    //     },
    //     recipients: [
    //         // console.log('empDetails.email ' + empDetails.email)
    //         //{ address: "sonukonge2010@gmail.com" }
    //          { address: empDetails.email },
    //         {
    //             address: {
    //                 "email": "hr@vaal-triangle.com",
    //                 "header_to": empManager[0].email
    //               }
    //           }
    //     ]
    // })
    //     .then(data => {
    //         console.log(data);
    //         const addEmailDetails = new EmailData()
    //         if (empManager._id == loginUser) {
    //             addEmailDetails.fromId = empManager._id;
    //             addEmailDetails.toId = empDetails._id;
    //         } else {
    //             addEmailDetails.fromId = empDetails._id;
    //             addEmailDetails.toId = empManager._id;
    //         }

    //         addEmailDetails.leaveId = leaveDetails._id;
    //         addEmailDetails.subject = emailSubject
    //         addEmailDetails.emailBody = htmlContent
    //         addEmailDetails.sendStatus = true
    //         addEmailDetails.save()
    //         // console.log(data);
    //         // console.log(empManager.email);
    //         // console.log(empDetails.email);
    //     })
    //     .catch(err => {
    //         console.log('Whoops! Something went wrong');
    //         console.log(err);
    //         return false;
    //     });

    return true;
}
const EmailData = mongoose.model('EmailData', emailDataSchema)
module.exports = EmailData