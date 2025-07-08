import React, { useState, useEffect } from 'react';
import './TaskModal.css';

const TaskModal = ({ task, users, onClose, onSave, existingTasks = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedUser: '',
    status: 'Todo',
    priority: 'Medium'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Column names that task titles cannot match
  const columnNames = ['Todo', 'In Progress', 'Done'];

  const validateTitle = (title) => {
    const errors = {};
    
    if (!title.trim()) {
      errors.title = 'Title is required';
      return errors;
    }

    // Check if title matches column names
    if (columnNames.includes(title.trim())) {
      errors.title = 'Task title cannot match column names (Todo, In Progress, Done)';
      return errors;
    }

    // Check for duplicate titles (excluding current task if editing)
    const duplicateTask = existingTasks.find(t => 
      t.title.toLowerCase() === title.toLowerCase().trim() && 
      (!task || t._id !== task._id)
    );
    
    if (duplicateTask) {
      errors.title = `A task with title "${title}" already exists`;
      return errors;
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation for title
    if (name === 'title') {
      const errors = validateTitle(value);
      setValidationErrors(prev => ({
        ...prev,
        title: errors.title || ''
      }));
    }
  };

  useEffect(() => {
    if (task) {
      // Handle assignedUser - it might be an object with username or just an ID
      let assignedUserId = '';
      if (task.assignedUser) {
        if (typeof task.assignedUser === 'object' && task.assignedUser._id) {
          assignedUserId = task.assignedUser._id;
        } else {
          assignedUserId = task.assignedUser;
        }
      }

      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignedUser: assignedUserId,
        status: task.status || 'Todo',
        priority: task.priority || 'Medium'
      });
      
      if (task.conflict) {
        setConflict(task.conflict);
      }
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate before submitting
    const titleErrors = validateTitle(formData.title);
    if (titleErrors.title) {
      setValidationErrors(titleErrors);
      setLoading(false);
      return;
    }

    try {
      const taskData = {
        ...formData,
        lastModified: task?.lastModified
      };

      await onSave(taskData);
    } catch (err) {
      console.error('TaskModal error:', err);
      setError(err.message || 'An error occurred while saving the task');
    } finally {
      setLoading(false);
    }
  };

  const handleConflictResolution = (choice) => {
    let resolvedData;
    
    if (choice === 'client') {
      resolvedData = { ...formData, lastModified: new Date() };
    } else if (choice === 'server') {
      resolvedData = { ...conflict.serverTask, lastModified: new Date() };
    } else {
      // Merge - combine both versions intelligently
      resolvedData = {
        title: formData.title || conflict.serverTask.title,
        description: formData.description || conflict.serverTask.description,
        assignedUser: formData.assignedUser || conflict.serverTask.assignedUser,
        status: formData.status || conflict.serverTask.status,
        priority: formData.priority || conflict.serverTask.priority,
        lastModified: new Date()
      };
    }

    onSave(resolvedData);
    setConflict(null);
  };

  const getAssignedUserName = (userId) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u._id === userId);
    return user ? user.username : 'Unknown User';
  };

  const getFieldDifference = (clientValue, serverValue, fieldName) => {
    if (clientValue === serverValue) return null;
    
    if (fieldName === 'assignedUser') {
      return {
        client: getAssignedUserName(clientValue),
        server: getAssignedUserName(serverValue)
      };
    }
    
    return {
      client: clientValue || 'Not set',
      server: serverValue || 'Not set'
    };
  };

  if (conflict) {
    const titleDiff = getFieldDifference(formData.title, conflict.serverTask.title, 'title');
    const descriptionDiff = getFieldDifference(formData.description, conflict.serverTask.description, 'description');
    const statusDiff = getFieldDifference(formData.status, conflict.serverTask.status, 'status');
    const priorityDiff = getFieldDifference(formData.priority, conflict.serverTask.priority, 'priority');
    const assignedUserDiff = getFieldDifference(formData.assignedUser, conflict.serverTask.assignedUser, 'assignedUser');

    return (
      <div className="modal-overlay">
        <div className="modal-content conflict-modal">
          <div className="modal-header">
            <h2>⚠️ Conflict Detected</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          
          <div className="conflict-content">
            <p className="conflict-message">
              This task was modified by another user while you were editing it. 
              Please choose how to resolve the conflict:
            </p>
            
            <div className="conflict-comparison">
              <div className="conflict-version">
                <h3>🖊️ Your Changes</h3>
                <div className="conflict-details">
                  {titleDiff && (
                    <div className="conflict-field">
                      <strong>Title:</strong> 
                      <span className="client-value">{titleDiff.client}</span>
                    </div>
                  )}
                  {descriptionDiff && (
                    <div className="conflict-field">
                      <strong>Description:</strong> 
                      <span className="client-value">{descriptionDiff.client}</span>
                    </div>
                  )}
                  {statusDiff && (
                    <div className="conflict-field">
                      <strong>Status:</strong> 
                      <span className="client-value">{statusDiff.client}</span>
                    </div>
                  )}
                  {priorityDiff && (
                    <div className="conflict-field">
                      <strong>Priority:</strong> 
                      <span className="client-value">{priorityDiff.client}</span>
                    </div>
                  )}
                  {assignedUserDiff && (
                    <div className="conflict-field">
                      <strong>Assigned To:</strong> 
                      <span className="client-value">{assignedUserDiff.client}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="conflict-version">
                <h3>🔄 Server Changes</h3>
                <div className="conflict-details">
                  {titleDiff && (
                    <div className="conflict-field">
                      <strong>Title:</strong> 
                      <span className="server-value">{titleDiff.server}</span>
                    </div>
                  )}
                  {descriptionDiff && (
                    <div className="conflict-field">
                      <strong>Description:</strong> 
                      <span className="server-value">{descriptionDiff.server}</span>
                    </div>
                  )}
                  {statusDiff && (
                    <div className="conflict-field">
                      <strong>Status:</strong> 
                      <span className="server-value">{statusDiff.server}</span>
                    </div>
                  )}
                  {priorityDiff && (
                    <div className="conflict-field">
                      <strong>Priority:</strong> 
                      <span className="server-value">{priorityDiff.server}</span>
                    </div>
                  )}
                  {assignedUserDiff && (
                    <div className="conflict-field">
                      <strong>Assigned To:</strong> 
                      <span className="server-value">{assignedUserDiff.server}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="conflict-actions">
              <button 
                className="conflict-btn client-btn"
                onClick={() => handleConflictResolution('client')}
                title="Keep your changes and overwrite server changes"
              >
                💾 Keep My Changes
              </button>
              <button 
                className="conflict-btn server-btn"
                onClick={() => handleConflictResolution('server')}
                title="Discard your changes and use server version"
              >
                🔄 Use Server Version
              </button>
              <button 
                className="conflict-btn merge-btn"
                onClick={() => handleConflictResolution('merge')}
                title="Combine both versions intelligently"
              >
                🔗 Merge Both
              </button>
              <button 
                className="conflict-btn cancel-btn"
                onClick={onClose}
                title="Cancel and keep current state"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={`form-input ${validationErrors.title ? 'error' : ''}`}
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
            />
            {validationErrors.title && <div className="error-message">{validationErrors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="assignedUser">
              Assign To
            </label>
            <select
              id="assignedUser"
              name="assignedUser"
              className="form-select"
              value={formData.assignedUser}
              onChange={handleChange}
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal; 