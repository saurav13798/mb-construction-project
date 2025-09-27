const nodemailer = require('nodemailer');

class EmailServicePremium {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize premium transporter:', err && err.message ? err.message : err);
      this.transporter = null;
    }
  }

  async sendContactNotification(contactData) {
    const { name, email, phone, company, service, message } = contactData;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Contact Form Submission - MB Construction',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #1f2937;">
          <h2 style="color: #0f172a; border-bottom: 3px solid #f59e0b; padding-bottom: 12px;">New Contact Form Submission</h2>

          <div style="background-color: #f8fafc; padding: 22px; border-radius: 10px; margin: 18px 0;">
            <p style="margin: 6px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 6px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 6px 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p style="margin: 6px 0;"><strong>Company:</strong> ${company || 'Not provided'}</p>
            <p style="margin: 6px 0;"><strong>Service:</strong> ${this.formatService(service)}</p>
            <p style="margin: 6px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString('en-IN')}</p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e6edf3; padding: 20px; border-radius: 8px;">
            <h3 style="color: #0f172a; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #334155;">${message}</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #fff8f1; border-radius: 8px;">
            <p style="margin: 0; color: #81471b;">
              <strong>Action Required:</strong> Please respond to this inquiry within 24 hours.
            </p>
          </div>
        </div>
      `
    };

    try {
      if (!this.transporter) throw new Error('Transporter not initialized');
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
        <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #1f2937;">
          <div style="background-color: #0f172a; color: #ffffff; padding: 22px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 22px;">MB Construction</h1>
            <p style="margin: 6px 0 0 0;">Building Tomorrow, Today</p>
          </div>

          <div style="padding: 30px 20px; background: #fff;">
            <h2 style="color: #0f172a;">Thank you for your inquiry!</h2>

            <p>Dear ${name},</p>

            <p>Thank you for contacting MB Construction. We have received your inquiry about our <strong>${this.formatService(service)}</strong> services.</p>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0f172a; margin-top: 0;">What happens next?</h3>
              <ul style="color: #334155; line-height: 1.6;">
                <li>Our team will review your message within 2-4 hours</li>
                <li>We'll contact you within 24 hours with a detailed response</li>
                <li>If urgent, call us directly at <strong>+91 98765 43210</strong></li>
              </ul>
            </div>

            <div style="background-color: #fff8f1; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px;">
              <p style="margin: 0; color: #6b3f00;"><strong>Our Expertise:</strong> ${this.getServiceDescription(service)}</p>
            </div>

            <p style="margin-top: 30px;">Best regards,<br>
            <strong>MB Construction Team</strong><br>
            📧 info@mbconstruction.com<br>
            📞 +91 98765 43210</p>
          </div>

          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; color: #475569; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p>This is an automated response. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };

    try {
      if (!this.transporter) throw new Error('Transporter not initialized');
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
      if (!this.transporter) throw new Error('Transporter not initialized');
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }
}

module.exports = new EmailServicePremium();
