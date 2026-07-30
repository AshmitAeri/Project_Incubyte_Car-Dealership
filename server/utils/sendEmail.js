const nodemailer = require('nodemailer');

/**
 * Send email notification using Nodemailer
 * @param {Object} options - Email options: to, subject, html
 */
const sendEmail = async (options) => {
  // Skip email in test environment
  if (process.env.NODE_ENV === 'test') return;

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Car Inventory System" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${options.to}`);
  } catch (error) {
    // Log but don't throw — email failure shouldn't break the request
    console.error(`❌ Email send failed: ${error.message}`);
  }
};

/**
 * Generate purchase confirmation email HTML
 */
const purchaseEmailTemplate = ({ userName, carName, quantity, totalAmount, orderId }) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
    .footer { background: #f9fafb; padding: 24px; text-align: center; color: #9ca3af; font-size: 12px; }
    .badge { display: inline-block; background: #10b981; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Purchase Confirmed!</h1>
      <span class="badge">Order #${orderId}</span>
    </div>
    <div class="body">
      <p>Dear <strong>${userName}</strong>,</p>
      <p>Thank you for your purchase! Here are your order details:</p>
      <div class="detail-row"><span>Car</span><strong>${carName}</strong></div>
      <div class="detail-row"><span>Quantity</span><strong>${quantity}</strong></div>
      <div class="detail-row"><span>Total Amount</span><strong>$${totalAmount.toLocaleString()}</strong></div>
      <p style="margin-top: 24px; color: #6b7280;">Your order is being processed. Our team will contact you shortly.</p>
    </div>
    <div class="footer">
      <p>© 2024 Car Inventory System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = { sendEmail, purchaseEmailTemplate };
