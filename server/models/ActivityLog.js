const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  username: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema); 