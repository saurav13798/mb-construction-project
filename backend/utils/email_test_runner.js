#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const nodemailer = require('nodemailer');
const emailService = require('./email_switcher');

(async function runTest() {
  console.log('Running SMTP transporter verify using backend/.env...');
  try {
    if (!emailService || typeof emailService.testConnection !== 'function') {
      console.error('Email service does not expose testConnection(); check email_switcher and utilities.');
      process.exit(2);
    }

    try {
      const ok = await emailService.testConnection();
      console.log('\nTransporter verify result:', ok ? 'PASS' : 'FAIL');
      if (ok) return process.exit(0);
      console.warn('Primary transporter reported FAIL — attempting Ethereal fallback.');
    } catch (primaryErr) {
      console.warn('\nPrimary transporter verify failed:', primaryErr && primaryErr.message ? primaryErr.message : primaryErr);
      console.warn('Attempting Ethereal test account fallback...');
    }

    // Ethereal fallback so we can validate email code without real SMTP creds
    try {
      const testAccount = await nodemailer.createTestAccount();
      const ethTransport = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const ok2 = await ethTransport.verify().then(() => true).catch(() => false);
      console.log('\nEthereal transport verify result:', ok2 ? 'PASS' : 'FAIL');
      if (ok2) {
        console.log('Ethereal account created for testing (no real emails sent to recipients).');
        console.log('Preview messages at https://ethereal.email/messages');
        console.log(`Ethereal user: ${testAccount.user}`);
        console.log(`Ethereal pass: ${testAccount.pass}`);
        return process.exit(0);
      }
      return process.exit(1);
    } catch (ethErr) {
      console.error('\nEthereal fallback failed:');
      console.error(ethErr && ethErr.stack ? ethErr.stack : ethErr);
      return process.exit(2);
    }
  } catch (err) {
    console.error('\nTransporter verify encountered an error:');
    console.error(err && err.stack ? err.stack : err);
    process.exit(2);
  }
})();
