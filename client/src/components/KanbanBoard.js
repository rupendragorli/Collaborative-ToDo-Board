import React, { useState, useEffect } from 'react';
import { DndContext } from '@dnd-kit/core';
import io from 'socket.io-client';
import TaskColumn from './TaskColumn';
import TaskModal from './TaskModal';
import ActivityLog from './ActivityLog';
import './KanbanBoard.css';

const BACKEND_URL = 'https://collaborative-todo-board-9paf.onrender.com';

const KanbanBoard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('https://collaborative-todo-board-9paf.onrender.com');
    // setSocket(newSocket); // This line is removed as per the edit hint
  
    // Socket event listeners
    newSocket.on('taskCreated', (task) => {
      setTasks(prev => {
        const alreadyExists = prev.some(t => t._id === task._id);
        return alreadyExists ? prev : [...prev, task];
      });
    });
  
    newSocket.on('taskUpdated', (updatedTask) => {
      console.log('Socket taskUpdated:', { id: updatedTask._id, title: updatedTask.title });
      setTasks(prev => {
        const newTasks = prev.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        );
        console.log('After socket taskUpdated - tasks:', newTasks.map(t => ({ id: t._id, title: t.title, status: t.status })));
        return newTasks;
      });
    });
  
    newSocket.on('taskDeleted', (taskId) => {
      setTasks(prev => prev.filter(task => task._id !== taskId));
    });
  
    // ✅ NEW: Listen for activity log updates
    newSocket.on('activity', (activity) => {
      console.log('Received activity event:', activity);
      setActivities(prev => {
        const alreadyExists = prev.some(a => a._id === activity._id);
        if (alreadyExists) {
          console.log('Activity already exists, not adding');
          return prev;
        }
        console.log('Adding new activity to list');
        return [activity, ...prev]; // Add to beginning for newest first
      });
    });
  
    // Load initial data
    loadData();
  
    return () => newSocket.close();
  }, []);
  
  

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load tasks
      const tasksResponse = await fetch(`${BACKEND_URL}/api/tasks`, { headers });
      const tasksData = await tasksResponse.json();
      console.log('Loaded tasks:', tasksData.map(t => ({ id: t._id, title: t.title, status: t.status })));
      setTasks(tasksData);

      // Load users
      const usersResponse = await fetch(`${BACKEND_URL}/api/users`, { headers });
      const usersData = await usersResponse.json();
      setUsers(usersData);

      // Load activities
      const activitiesResponse = await fetch(`${BACKEND_URL}/api/activity`, { headers });
      const activitiesData = await activitiesResponse.json();
      setActivities(activitiesData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  // Update handleDragEnd for @dnd-kit
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find the task being dragged
    const task = tasks.find(t => t._id === active.id);
    if (!task) return;

    // Determine new status based on the column it was dropped into
    const statusMapping = {
      'todo': 'Todo',
      'in-progress': 'In Progress',
      'done': 'Done'
    };
    const destinationStatus = statusMapping[over.id];
    if (!destinationStatus) return;

    // Only update if status actually changes
    if (task.status !== destinationStatus) {
      const updatedTask = { ...task, status: destinationStatus };
      // Optimistically update UI
      setTasks(prev => prev.map(t => t._id === task._id ? updatedTask : t));
      // Persist to server
      // (You may want to keep your async update logic here)
    }
  };

  const handleConflict = (conflictData, clientTask) => {
    // Show conflict resolution modal
    setEditingTask({
      ...clientTask,
      conflict: {
        serverTask: conflictData.serverTask,
        clientTask: conflictData.clientTask
      }
    });
    setShowModal(true);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete task');

      setTasks(prev => prev.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleSmartAssign = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/tasks/${taskId}/smart-assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to smart assign task');

      const updatedTask = await response.json();
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error smart assigning task:', error);
    }
  };



  const columns = [
    { id: 'todo', title: 'Todo', color: '#ff6b6b' },
    { id: 'in-progress', title: 'In Progress', color: '#4ecdc4' },
    { id: 'done', title: 'Done', color: '#45b7d1' }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading board...</p>
      </div>
    );
  }

  // Debug: log columns and tasks being rendered
  console.log('Columns:', columns.map(c => c.id));
  console.log('Tasks:', tasks.map(t => ({ id: t._id, title: t.title, status: t.status })));

  return (
    <div className="kanban-container">
      <header className="kanban-header">
        <div className="header-left">
          <h1>Collaborative ToDo Board</h1>
          <p>Welcome, {user.username}!</p>
        </div>
        <div className="header-right">
          <button className="create-task-btn" onClick={handleCreateTask}>
            + New Task
          </button>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="kanban-content">
        <div className="kanban-board">
          <DndContext onDragEnd={handleDragEnd}>
            {columns.map(column => {
              const statusMapping = {
                'todo': 'Todo',
                'in-progress': 'In Progress',
                'done': 'Done'
              };
              const columnTasks = tasks.filter(task => task.status === statusMapping[column.id]);
              return (
                <TaskColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  users={users}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onSmartAssign={handleSmartAssign}
                />
              );
            })}
          </DndContext>
        </div>

        <div className="activity-sidebar">
          <ActivityLog activities={activities} />
        </div>
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          users={users}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSave={async (taskData) => {
            try {
              const token = localStorage.getItem('token');
              const method = editingTask ? 'PUT' : 'POST';
              const url = editingTask ? `/api/tasks/${editingTask._id}` : '/api/tasks';
              
              const response = await fetch(`${BACKEND_URL}${url.startsWith('/') ? url : '/' + url}`, {
                method,
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
              });

              if (response.status === 409) {
                const conflictData = await response.json();
                handleConflict(conflictData, taskData);
                return;
              }

              if (!response.ok) throw new Error('Failed to save task');

              setShowModal(false);
              setEditingTask(null);
            } catch (error) {
              console.error('Error saving task:', error);
            }
          }}
        />
      )}
    </div>
  );
};

export default KanbanBoard; 