const Visit = require('../models/Visit');

async function trackVisit(req, res, next) {
  try {
    // Optionally filter out admin or bot visits based on user-agent or IP here
    await Visit.create({});
  } catch (error) {
    console.error('Visit tracking error:', error);
  }
  next();
}

module.exports = trackVisit;
