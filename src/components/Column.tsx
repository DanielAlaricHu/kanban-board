import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
// Redux
import { useDispatch } from 'react-redux';
import { moveTask } from '../features/columnsSlice';
// Context
import { useAuth } from '../context/AuthContext';
// Custom types
import { ColumnType } from '../types/ColumnType';
// Components
import TaskItem from './TaskItem';
// Firebase
import { moveTaskBetweenColumns } from '../firebase/firestoreUtils';

const Column: React.FC<ColumnType & { onAddTask: (state: string) => void }> = ({
  id: newColumnID,
  name,
  themeColor,
  tasks,
  onAddTask,
}) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: async (item: { id: string; columnId: string }) => {
      if (item.columnId !== newColumnID) {
        if (!user) return;

        try {
          // Note: await is better, but affect UI.
          // Update Firestore to move the task to the new column
          moveTaskBetweenColumns(user.uid, item.columnId, newColumnID, item.id);

          // Dispatch Redux actions to update the state
          dispatch(moveTask({ taskId: item.id, fromColumnId: item.columnId, toColumnId: newColumnID }));
        } catch (error) {
          console.error('Error moving task:', error);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));
  drop(ref);
  
  return (
    <div
      ref={ref} 
      className={`bg-white rounded-lg m-2 p-2 overflow-auto relative shadow-md ${
        isOver ? 'bg-blue-100' : ''
      } flex flex-col`}
    >
      <h2 className="text-xl font-semibold mb-2">{name}</h2>
      <div
        className={`space-y-2 flex-grow ${
          tasks.length === 0 ? 'flex items-center justify-center' : ''
        }`}
      >
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              columnId={newColumnID}
              themeColor={themeColor}
            />
          ))
        ) : (
          <div className="text-gray-500 text-center">No tasks right now, take a rest!</div>
        )}
      </div>
      <button
        className="absolute bottom-4 right-4 bg-white text-blue-500 rounded-full shadow-lg w-12 h-12 flex items-center justify-center hover:shadow-xl"
        onClick={() => onAddTask(newColumnID)}
      >
        <span className="text-2xl font-bold">+</span>
      </button>
    </div>
  );
};

export default Column;