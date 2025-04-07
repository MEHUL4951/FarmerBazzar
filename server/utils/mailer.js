
import nodemailer from 'nodemailer'
import dotenv  from 'dotenv'
dotenv.config()


const transporter = nodemailer.createTransport({
    service: 'gmail',
    port:465,
    secure:true,
    secureConnection:false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password
    },
    tls:{
         rejectUnauthorized:true
    }
  });

// Function to send email
const sendMail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(`Failed to send email: ${error.message}`);
      } else {
        resolve(`Email sent: ${info.response}`);
      }
    });
  });
};

export default  sendMail;
