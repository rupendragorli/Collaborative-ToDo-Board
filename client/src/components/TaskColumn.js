import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import './TaskColumn.css';

const TaskColumn = ({ column, tasks, users, onEdit, onDelete, onSmartAssign }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="task-column" ref={setNodeRef}>
      <div className="column-header" style={{ borderLeftColor: column.color }}>
        <h3>{column.title}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div className="column-content">
        <SortableContext items={tasks.map(task => task._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => (
            <TaskCard
              key={task._id}
              task={task}
              index={index}
              users={users}
              onEdit={onEdit}
              onDelete={onDelete}
              onSmartAssign={onSmartAssign}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default TaskColumn;
