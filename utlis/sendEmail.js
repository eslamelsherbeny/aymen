// send Email
const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.Email_HOST,
    port: process.env.Email_PORT,
    auth: {
      user: process.env.Email_USER,
      pass: process.env.Email_PASSWORD,
    },
  });

  const mailOptions = {
    from: `from Aymen Store <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
