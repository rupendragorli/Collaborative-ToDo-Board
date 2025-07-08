const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');

const router = express.Router();

const FORBIDDEN_TITLES = ['Todo', 'In Progress', 'Done'];

// Get io instance
function getIO(req) {
  return req.app.get('io');
}

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedUser', 'username email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, assignedUser, status, priority } = req.body;
    if (FORBIDDEN_TITLES.includes(title)) {
      return res.status(400).json({ message: 'Title cannot match column names' });
    }
    const existing = await Task.findOne({ title });
    if (existing) {
      return res.status(400).json({ message: 'Task title must be unique' });
    }
    const task = new Task({ title, description, assignedUser, status, priority });
    await task.save();
    // Populate the assignedUser field before sending response
    await task.populate('assignedUser', 'username email');
    const io = getIO(req);
    io.emit('taskCreated', task);
    const activity = await ActivityLog.create({ username: req.user.username, action: `created task '${title}'` });
    // Keep only the 20 most recent activity logs
    const count = await ActivityLog.countDocuments();
    if (count > 20) {
      const oldest = await ActivityLog.find().sort({ timestamp: 1 }).limit(count - 20);
      const idsToDelete = oldest.map(a => a._id);
      await ActivityLog.deleteMany({ _id: { $in: idsToDelete } });
    }
    console.log('Created activity:', activity);
    io.emit('activity', activity);
    console.log('Emitted activity event');
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task (with conflict handling)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, assignedUser, status, priority, lastModified } = req.body;
    if (title && FORBIDDEN_TITLES.includes(title)) {
      return res.status(400).json({ message: 'Title cannot match column names' });
    }
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    // Conflict detection
    if (lastModified && new Date(lastModified).getTime() !== new Date(task.lastModified).getTime()) {
      return res.status(409).json({
        message: 'Conflict detected',
        serverTask: task,
        clientTask: req.body
      });
    }
    // Unique title check
    if (title && title !== task.title) {
      const existing = await Task.findOne({ title });
      if (existing) {
        return res.status(400).json({ message: 'Task title must be unique' });
      }
    }
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedUser !== undefined) task.assignedUser = assignedUser;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    task.lastModified = new Date();
    await task.save();
    // Populate the assignedUser field before sending response
    await task.populate('assignedUser', 'username email');
    const io = getIO(req);
    io.emit('taskUpdated', task);
    // await ActivityLog.create({ username: req.user.username, action: `updated task '${task.title}'` });
    const activity = await ActivityLog.create({ username: req.user.username, action: `updated task '${task.title}'` });
    // Keep only the 20 most recent activity logs
    const count = await ActivityLog.countDocuments();
    if (count > 20) {
      const oldest = await ActivityLog.find().sort({ timestamp: 1 }).limit(count - 20);
      const idsToDelete = oldest.map(a => a._id);
      await ActivityLog.deleteMany({ _id: { $in: idsToDelete } });
    }
    io.emit('activity', activity);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const io = getIO(req);
    io.emit('taskDeleted', task._id);
    // await ActivityLog.create({ username: req.user.username, action: `deleted task '${task.title}'` });
    const activity = await ActivityLog.create({ username: req.user.username, action: `deleted task '${task.title}'` });
    // Keep only the 20 most recent activity logs
    const count = await ActivityLog.countDocuments();
    if (count > 20) {
      const oldest = await ActivityLog.find().sort({ timestamp: 1 }).limit(count - 20);
      const idsToDelete = oldest.map(a => a._id);
      await ActivityLog.deleteMany({ _id: { $in: idsToDelete } });
    }
    io.emit('activity', activity);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Smart Assign: assign to user with fewest non-done tasks
router.post('/:id/smart-assign', auth, async (req, res) => {
  try {
    const users = await User.find();
    let minTasks = Infinity;
    let bestUser = null;
    for (const user of users) {
      const count = await Task.countDocuments({ assignedUser: user._id, status: { $ne: 'Done' } });
      if (count < minTasks) {
        minTasks = count;
        bestUser = user;
      }
    }
    if (!bestUser) return res.status(400).json({ message: 'No users found' });
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assignedUser: bestUser._id, lastModified: new Date() },
      { new: true }
    ).populate('assignedUser', 'username email');
    const io = getIO(req);
    io.emit('taskUpdated', task);
    // await ActivityLog.create({ username: req.user.username, action: `smart assigned task '${task.title}' to '${bestUser.username}'` });
    const activity = await ActivityLog.create({ username: req.user.username, action: `smart assigned task '${task.title}' to '${bestUser.username}'` });
    // Keep only the 20 most recent activity logs
    const count = await ActivityLog.countDocuments();
    if (count > 20) {
      const oldest = await ActivityLog.find().sort({ timestamp: 1 }).limit(count - 20);
      const idsToDelete = oldest.map(a => a._id);
      await ActivityLog.deleteMany({ _id: { $in: idsToDelete } });
    }
    io.emit('activity', activity);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 