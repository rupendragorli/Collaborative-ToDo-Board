# Collaborative Real-Time To-Do Board

A full-stack, real-time collaborative Kanban board where multiple users can manage tasks, see changes live, and resolve conflicts—similar to a minimal Trello board, but with custom business logic.

---

## 🚀 Project Overview

This app allows users to:
- Register and log in securely
- Create, edit, assign, and drag tasks between columns (Todo, In Progress, Done)
- See all changes in real time (across all users)
- View a live-updating activity log of the last 20 actions
- Use “Smart Assign” to automatically assign tasks to the user with the fewest active tasks
- Resolve conflicts if two users edit the same task at the same time

---

## 🛠 Tech Stack

- **Frontend:** React (no UI template libraries), @dnd-kit for drag-and-drop, Socket.IO client
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT for auth, bcrypt for password hashing
- **Deployment:** (You will fill in your deployment links)
- **Demo Video:** (You will fill in your video link)

---

## 📦 Features List

- **User Registration & Login:** Secure, JWT-based, hashed passwords
- **Kanban Board:** 3 columns (Todo, In Progress, Done), drag-and-drop tasks, assign to users
- **Task Management:** Title, description, assigned user, status, priority; unique title validation
- **Smart Assign:** Assigns task to user with fewest active (non-done) tasks
- **Real-Time Sync:** All changes (tasks, assignments, activity log) update live for all users
- **Activity Log:** Last 20 actions, live-updating, shows who did what and when
- **Conflict Handling:** If two users edit the same task, both are prompted to resolve (merge/overwrite)
- **Custom Animations:** Smooth drag/drop, card bounce, responsive design
- **No UI Frameworks:** 100% custom CSS, works on desktop and mobile

---

## 🖥️ Screenshots

*(Add screenshots of your Kanban board, activity log, and conflict resolution modal here)*

---

## 📝 Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

### 2. Backend Setup

```bash
cd server
npm install
```

- Create a `.env` file in the `server` directory with:
  ```
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  ```
- Or edit `server/config.js` to set your MongoDB URI and JWT secret.

- Start the backend:
  ```bash
  npm run dev
  # or
  npm start
  ```

### 3. Frontend Setup

```bash
cd ../client
npm install
npm start
```

- The React app will run on [http://localhost:3000](http://localhost:3000) and proxy API requests to the backend.

---

## 🌐 Deployment

- **Frontend:** Deploy `client` to Vercel, Netlify, or similar.
- **Backend:** Deploy `server` to Render, Railway, Cyclic, or Heroku.
- Set environment variables for production in your deployment dashboard.

---

## 🔑 Environment Variables

**Backend (`server/.env`):**
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for JWT signing

**Frontend:** No special variables needed unless your backend is not on localhost.

---

## 👤 User Model

- `username` (unique, required)
- `email` (unique, required)
- `password` (hashed, required)

## 🗂 Task Model

- `title` (unique, required, cannot match column names)
- `description`
- `assignedUser` (User reference)
- `status` (Todo, In Progress, Done)
- `priority` (Low, Medium, High)
- `lastModified` (for conflict detection)

---

## 🔄 Real-Time & Activity Log

- Uses Socket.IO for live updates on all task and activity changes.
- Activity log keeps only the 20 most recent actions (add/edit/delete/assign/drag-drop).

---

## 🧠 Smart Assign Logic

When you click “Smart Assign” on a task, the backend finds the user with the fewest active (non-done) tasks and assigns the task to them. See [Logic_Document.md](./Logic_Document.md) for a detailed explanation.

---

## ⚔️ Conflict Handling

If two users edit the same task at the same time, the backend detects the conflict and returns both versions. The frontend shows a modal where users can choose to keep their version, the server version, or merge fields. See [Logic_Document.md](./Logic_Document.md) for details and examples.

---

## 📝 Usage Guide

1. **Register/Login:** Create an account or log in.
2. **Create Tasks:** Add tasks with unique titles.
3. **Drag & Drop:** Move tasks between columns.
4. **Assign/Smart Assign:** Assign tasks to users or use Smart Assign.
5. **Activity Log:** See all recent actions live.
6. **Conflict Resolution:** If prompted, resolve task edit conflicts.

---

## 📄 Logic Document

See [Logic_Document.md](./Logic_Document.md) for:
- How Smart Assign works
- How conflict handling works (with examples)

---

## 📹 Demo Video

- [Demo Video Link](#) *(Replace with your actual link)*

---

## 🛠️ Development Scripts

**Backend:**
- `npm run dev` — Start backend with nodemon
- `npm start` — Start backend

**Frontend:**
- `npm start` — Start React app
- `npm run build` — Build for production

---

## 📝 License

MIT (or your preferred license)

---

**For any issues, please open an issue or contact [your email].** 