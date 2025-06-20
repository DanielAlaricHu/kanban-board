import React, { useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
// Redux
import { useDispatch } from 'react-redux';
import { removeTask } from '../features/columnsSlice';
// Context
import { useAuth } from '../context/AuthContext';
// Components
import TaskDialog from './TaskDialog';
// Custom types
import { TaskType } from '../types/TaskType';
// Firebase
import { deleteTaskFromFirestore } from '../firebase/firestoreUtils';
// MUI
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const TaskItem: React.FC<{ task: TaskType; themeColor: string; columnId: string }> = ({
  task,
  themeColor,
  columnId,
}) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  // Dialogs and menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // Option menu
  const [isEditing, setIsEditing] = useState(false); // Task dialog
  // DnD
  const ref = useRef<HTMLDivElement>(null);

  // -----------------------------------------------
  // Drag and drop setup

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id, columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  drag(ref);

  // -----------------------------------------------
  // Handle option menu (3 dots)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // -----------------------------------------------
  // Handle task dialog

  const handleEdit = () => {
    setIsEditing(true); // Enable editing mode
    handleMenuClose(); // Close the menu
  };

  // -----------------------------------------------
  // Task actions

  const handleDelete = async () => {
    try {
      if (!user) throw new Error('User is not authenticated');
      
      await deleteTaskFromFirestore(user.uid, columnId, task.id); // DB
      dispatch(removeTask({ columnId, taskId: task.id })); // Redux, UI
      handleMenuClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // -----------------------------------------------
  // Render

  return (
    <>
      <div
        ref={ref}
        className={`p-4 bg-white rounded shadow flex items-center justify-between ${
          isDragging ? 'opacity-50' : 'opacity-100'
        }`}
        style={{
          borderLeft: `4px solid ${themeColor}`,
        }}
      >
        <div className="flex-grow">
          <h3 className="font-bold">{task.title}</h3>
          <p className="text-sm text-gray-600">{task.description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <IconButton aria-label="Options" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleEdit}>Edit</MenuItem>
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          </Menu>
        </div>
      </div>

      {/* TaskDialog for editing */}
      {isEditing && (
        <TaskDialog
          open={isEditing}
          onClose={() => setIsEditing(false)} 
          defaultState={columnId} // State = Column, State of task progress
          initialValues={task} 
          isEditing={true} // To indicate task dialog is in edit mode, not creation mode
        />
      )}
    </>
  );
};

export default TaskItem;