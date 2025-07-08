import React from 'react';
import './ActivityLog.css';

const ActivityLog = ({ activities }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="activity-log">
      <h3 className="activity-title">
        📋 Activity Log
        <span className="activity-count">{activities.length}</span>
      </h3>
      
      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="no-activities">
            <p>No activities yet</p>
            <span>Start creating tasks to see activity here!</span>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={activity._id || index} className="activity-item">
              <div className="activity-content">
                <span className="activity-user">{activity.username}</span>
                <span className="activity-action">{activity.action}</span>
              </div>
              <span className="activity-time">{formatTime(activity.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog; 