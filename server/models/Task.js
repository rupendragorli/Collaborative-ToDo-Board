const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  lastModified: { type: Date, default: Date.now },
}, { timestamps: true });

TaskSchema.index({ title: 1 }, { unique: true }); // Unique per board (single board for now)

module.exports = mongoose.model('Task', TaskSchema); 