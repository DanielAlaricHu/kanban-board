import React, { useState, useEffect } from 'react';
// Redux
import { useSelector, useDispatch } from 'react-redux';
import { addTask, updateTask } from '../features/columnsSlice';
// Context
import { useAuth } from '../context/AuthContext';
// Custom types
import { ColumnType } from '../types/ColumnType';
// Firebase
import { addTaskToFirestore, updateTaskInFirestore } from '../firebase/firestoreUtils';
// MUI
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress'; // Import MUI CircularProgress

// TODO: Set this as a global constant in separate file
const MAX_CHAR_LIMIT = 250;

const TaskDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  defaultState: string;
  initialValues?: { id: string; title: string; description: string }; // Optional initial values for editing
  isEditing?: boolean; // Flag for editing mode
}> = ({ open, onClose, defaultState, initialValues, isEditing = false }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false); 
  // For getting options for the state dropdown
  const columns = useSelector((state: { columns: ColumnType[] }) => state.columns);
  // Task details
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    // If in editing mode, populate the fields with initial values
    if (isEditing && initialValues) {
      setTitle(initialValues.title);
      setDescription(initialValues.description); 
    } 
    // In any mode, set the state to the default state
    setState(defaultState); 
  }, [isEditing, initialValues, defaultState]);

  // Save the task (add or update)
  const handleSave = async () => {
    try {
      if (!user) throw new Error('User is not authenticated');

      setIsLoading(true); 

      const taskId = initialValues?.id || crypto.randomUUID();
      const task = {
        id: taskId,
        title,
        description,
      };

      if (isEditing) {
        // Update the task in Firestore
        await updateTaskInFirestore(user.uid, state, task);
        // Dispatch Redux action to update the state
        dispatch(updateTask({ columnId: state, task }));
      } else {
        // Add the task to Firestore
        await addTaskToFirestore(user.uid, state, task);
        // Dispatch Redux action to add the task
        dispatch(addTask({ columnId: state, task }));
      }

      // Close the dialog
      onClose();
    } catch (error) {
      console.error('Error saving task to Firestore:', error);
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          width: '1000px', 
          maxWidth: '95%',
        },
      }}
    >
      <DialogTitle>{isEditing ? 'Edit Task' : 'New Task'}</DialogTitle>
      <DialogContent>
        <div className="flex gap-4">
          <TextField
            label="Title"
            variant="standard"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, MAX_CHAR_LIMIT))}
            helperText={`${title.length}/${MAX_CHAR_LIMIT}`}
            style={{ flex: 7 }}
            disabled={isLoading} 
          />
          <TextField
            select
            label="State"
            variant="standard"
            margin="normal"
            value={state}
            onChange={(e) => setState(e.target.value)}
            style={{ flex: 3 }}
            disabled={isLoading} 
          >
            {columns.map((column) => (
              <MenuItem key={column.id} value={column.id}>
                {column.name}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <TextField
          label="Description (Optional)"
          variant="standard"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, MAX_CHAR_LIMIT))}
          helperText={`${description.length}/${MAX_CHAR_LIMIT}`}
          disabled={isLoading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={title.trim() === '' || isLoading} 
        >
          {isLoading ? <CircularProgress size={24} /> : isEditing ? 'Edit' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog;