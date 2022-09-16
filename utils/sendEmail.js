// const nodemailer = require("nodemailer");


// function sendEmail(mailDetails) {
//     let mailTransporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: process.env.FROM_EMAIL,
//             pass: process.env.EMAIL_PASSWORD,
//         },
//     });

//     return new Promise((resolve, reject) => {
//         mailTransporter.sendMail(mailDetails, function (error, result) {
//             if (error) {
//                 return reject(error);
//             } else {
//                 return resolve(result);
//             }
//         });
//     });
// }

// module.exports = {sendEmail};
