# Collaborative ToDo Board

## Project Overview
Collaborative ToDo Board is a real-time Kanban-style task management application that allows multiple users to manage, assign, and track tasks collaboratively. It features live updates, activity logs, smart task assignment, and conflict resolution for seamless teamwork.

## Tech Stack
- **Frontend:** React, @dnd-kit/core (for drag-and-drop), Socket.IO Client, CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO
- **Deployment:**
  - Backend: Render.com
  - Frontend: Netlify

## Live Demo & Links
- **Backend:** [https://collaborative-todo-board-9paf.onrender.com/](https://collaborative-todo-board-9paf.onrender.com/)
- **Frontend:** [https://real-time-todo-board.netlify.app/login](https://real-time-todo-board.netlify.app/login)
- **Demo Video:** [Watch on Loom](https://www.loom.com/share/7c0402193ea54fb89b0c0c2443a9417f?sid=9d1394ff-dc1c-46ea-8665-188e67556244)

---

## Setup & Installation

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn
- MongoDB (local or Atlas)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd ToDoProject
```

### 2. Backend Setup
```bash
cd server
npm install
# Create a .env file if needed for MongoDB URI and JWT secret
# Example .env:
# MONGO_URI=mongodb://localhost:27017/todoproject
# JWT_SECRET=your_jwt_secret
npm start
```
The backend will run on `http://localhost:5000` by default.

### 3. Frontend Setup
```bash
cd ../client
npm install
npm start
```
The frontend will run on `http://localhost:3000` by default.

---

## Features & Usage Guide

- **User Authentication:** Register and log in to access the board.
- **Kanban Board:** Tasks are organized in Todo, In Progress, and Done columns.
- **Real-Time Collaboration:** All changes are synced instantly across all users via Socket.IO.
- **Task Management:** Create, edit, delete, and assign tasks to users.
- **Drag-and-Drop:** Move tasks between columns (if enabled) or use the "Mark as Done" button.
- **Activity Log:** See a real-time feed of all actions (task creation, updates, deletions, assignments).
- **Smart Assign:** Assigns a task to the user with the fewest non-done tasks.
- **Conflict Handling:** If two users edit the same task simultaneously, a conflict resolution modal appears to merge or choose a version.

### Usage
1. **Register/Login:** Create an account or log in.
2. **Create Task:** Click "+ New Task", fill in details, and save.
3. **Edit/Delete:** Use the pencil or trash icons on each task card.
4. **Assign/Smart Assign:** Assign manually or click the 🎯 button for Smart Assign.
5. **Mark as Done:** Click the ✅ button to move a task to Done.
6. **Activity Log:** View all recent actions in the sidebar.

---

## Smart Assign Logic
When you click the 🎯 Smart Assign button on a task, the backend:
- Counts the number of tasks (not marked as Done) assigned to each user.
- Assigns the task to the user with the fewest such tasks.
- Updates all clients in real time.

## Conflict Handling Logic
If two users try to update the same task at the same time:
- The backend detects a conflict using the `lastModified` timestamp.
- The client receives a conflict response and shows a modal.
- The user can choose to keep their version, use the server version, or merge both.

---

**For any issues, please open an issue or contact [rupendragorli0221@gmail.com].** 