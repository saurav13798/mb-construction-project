// Simple switcher to choose email implementation: default or premium
// Set environment variable USE_PREMIUM_EMAIL=true to enable premium templates

const usePremium = process.env.USE_PREMIUM_EMAIL === 'true';

let service;
if (usePremium) {
  try {
    service = require('./email_utility_premium');
    console.log('Using premium email templates (email_utility_premium.js)');
  } catch (err) {
    console.warn('Premium email utility not found, falling back to default email_utility.js');
    service = require('./email_utility');
  }
} else {
  service = require('./email_utility');
}

module.exports = service;
