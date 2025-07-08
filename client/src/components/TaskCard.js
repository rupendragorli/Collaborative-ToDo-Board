import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './TaskCard.css';

const TaskCard = ({ task, index, users, onEdit, onDelete, onSmartAssign }) => {
  const [showActions, setShowActions] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  // Handle touch events for mobile hold feedback
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  const style = {
    transform: isDragging ? 'scale(1.05)' : CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 0.2s ease',
    transformOrigin: 'center',
    // Mobile-specific drag styling
    ...(isDragging && isTouchDevice() && {
      zIndex: 9999,
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      opacity: 0.9,
    }),
  };

  // Show actions on mobile, or on hover for desktop
  const shouldShowActions = isTouchDevice() || showActions;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#e74c3c';
      case 'Medium': return '#f39c12';
      case 'Low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getAssignedUser = () => {
    if (!task.assignedUser) return 'Unassigned';
    if (typeof task.assignedUser === 'object' && task.assignedUser.username) {
      return task.assignedUser.username;
    }
    const user = users.find(u => u._id === task.assignedUser);
    return user ? user.username : 'Unknown User';
  };

  const handleButtonClick = (action, taskId, e) => {
    e.preventDefault();
    e.stopPropagation();
    switch (action) {
      case 'edit':
        onEdit(task);
        break;
      case 'delete':
        onDelete(taskId);
        break;
      case 'smartAssign':
        onSmartAssign(taskId);
        break;
      default:
        console.error('Unknown action:', action);
    }
  };

  // Ensure we have a valid task ID
  if (!task._id) {
    console.error('Task missing ID:', task);
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'dragging' : ''} ${isAnimating ? 'bounce' : ''}`}
      onMouseEnter={() => !isTouchDevice() && setShowActions(true)}
      onMouseLeave={() => !isTouchDevice() && setShowActions(false)}
      onAnimationEnd={() => setIsAnimating(false)}
    >
      {/* Drag area - only this part should have drag listeners */}
      <div 
        className="task-drag-area"
        {...attributes}
        {...listeners}
      >
        <div className="task-header">
          <h4 className="task-title">
            {task.title}
          </h4>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-footer">
          <div className="task-meta">
            <span 
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            >
              {task.priority}
            </span>
            <span className="assigned-user">
              👤 {getAssignedUser()}
            </span>
          </div>
          
          <div className="task-date">
            {new Date(task.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Action buttons - separate from drag area */}
      <div className="task-actions">
        {shouldShowActions && (
          <div 
            className="action-buttons" 
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <button 
              className="action-btn edit-btn"
              onClick={(e) => handleButtonClick('edit', task._id, e)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              title="Edit Task"
            >
              ✏️
            </button>
            <button 
              className="action-btn delete-btn"
              onClick={(e) => handleButtonClick('delete', task._id, e)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              title="Delete Task"
            >
              🗑️
            </button>
            <button 
              className="action-btn smart-assign-btn"
              onClick={(e) => handleButtonClick('smartAssign', task._id, e)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              title="Smart Assign"
            >
              🎯
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
