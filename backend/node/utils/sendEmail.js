const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_SERVER,
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_SECURE === 'true', // Sử dụng biến môi trường, mặc định là false
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Chấp nhận các chứng chỉ TLS tự ký
      }
    });

    // Kiểm tra kết nối trước khi gửi
    await transporter.verify();
    
    console.log(`Sending email to ${email} with subject: ${subject}`);
    
    const mailOptions = {
      from: `"2NADH" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">2NADH</h2>
        <p>${message}</p>
       
      </div>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error(`Không thể gửi email: ${error.message}`);
  }
};

module.exports = sendEmail;
