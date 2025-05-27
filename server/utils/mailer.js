
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
const sendMail = async (to, subject, options) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    ...(options.text && { text: options.text }),   // Include plain text if provided
    ...(options.html && { html: options.html })    // Include HTML if provided
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
