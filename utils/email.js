const nodemailer = require('nodemailer');

const sendMailer = async (options) => {
  //* 1) Create a transporter

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  //* 2) Define the email options

  const mailOptions = {
    from: 'GLord <2hJQ0@example.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  //* 3) Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendMailer;
