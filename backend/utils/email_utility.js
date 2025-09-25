const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendContactNotification(contactData) {
    const { name, email, phone, company, service, message } = contactData;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Contact Form Submission - MB Construction',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5282; border-bottom: 2px solid #3182ce; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Company:</strong> ${company || 'Not provided'}</p>
            <p><strong>Service:</strong> ${this.formatService(service)}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-IN')}</p>
          </div>

          <div style="background-color: #fff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
            <h3 style="color: #2d3748; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #4a5568;">${message}</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #bee3f8; border-radius: 8px;">
            <p style="margin: 0; color: #2c5282;">
              <strong>Action Required:</strong> Please respond to this inquiry within 24 hours.
            </p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Admin notification email sent successfully');
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      throw error;
    }
  }

  async sendAutoReply(contactData) {
    const { name, email, service } = contactData;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Thank you for contacting MB Construction',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2c5282; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">MB Construction</h1>
            <p style="margin: 5px 0 0 0;">Building Tomorrow, Today</p>
          </div>

          <div style="padding: 30px 20px;">
            <h2 style="color: #2c5282;">Thank you for your inquiry!</h2>

            <p>Dear ${name},</p>

            <p>Thank you for contacting MB Construction. We have received your inquiry about our <strong>${this.formatService(service)}</strong> services.</p>

            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d3748; margin-top: 0;">What happens next?</h3>
              <ul style="color: #4a5568; line-height: 1.6;">
                <li>Our team will review your message within 2-4 hours</li>
                <li>We'll contact you within 24 hours with a detailed response</li>
                <li>If urgent, call us directly at <strong>+91 98765 43210</strong></li>
              </ul>
            </div>

            <div style="background-color: #e6fffa; border-left: 4px solid #38b2ac; padding: 15px;">
              <p style="margin: 0; color: #2c7a7b;">
                <strong>Our Expertise:</strong> ${this.getServiceDescription(service)}
              </p>
            </div>

            <p style="margin-top: 30px;">Best regards,<br>
            <strong>MB Construction Team</strong><br>
            📧 info@mbconstruction.com<br>
            📞 +91 98765 43210</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; font-size: 12px;">
            <p>This is an automated response. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Auto-reply email sent successfully');
    } catch (error) {
      console.error('Failed to send auto-reply:', error);
      throw error;
    }
  }

  formatService(service) {
    const serviceMap = {
      'redevelopment': 'Building Redevelopment',
      'maintenance': 'Government Contract Road & Building Maintenance',
      'manpower': 'Manpower Supply (Engineer to Labour)',
      'other': 'Other Services'
    };
    return serviceMap[service] || service;
  }

  getServiceDescription(service) {
    const descriptions = {
      'redevelopment': 'Comprehensive residential and commercial redevelopment with modern design standards.',
      'maintenance': 'Reliable government contract services with full compliance and quality assurance.',
      'manpower': 'Skilled workforce supply from qualified engineers to experienced laborers.',
      'other': 'Custom construction solutions tailored to your specific needs.'
    };
    return descriptions[service] || 'Professional construction services with quality guarantee.';
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();