import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// Redux
import { useDispatch, useSelector } from 'react-redux';
import { addColumn, updateColumn, deleteColumn } from '../features/columnsSlice';
// Context
import { useAuth } from '../context/AuthContext';
// Custom types
import { ColumnType, EditableColumnType } from '../types/ColumnType';
// Firebase
import { deleteColumnFromFirestore, updateColumnInFirestore, addColumnToFirestore } from '../firebase/firestoreUtils';
// MUI
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, TextField } from '@mui/material';
import { Delete as DeleteIcon, DragIndicator as DragIcon } from '@mui/icons-material';
// Other
import { v4 as uuidv4 } from 'uuid';

interface ManageColumnsDialogProps {
  open: boolean;
  onClose: () => void;
}

const ManageColumnsDialog: React.FC<ManageColumnsDialogProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const columns = useSelector((state: { columns: ColumnType[] }) => state.columns);
  const [columnEdits, setColumnEdits] = useState<EditableColumnType[]>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  useEffect(() => {
    setColumnEdits(
      columns.map((column) => ({
        id: column.id,
        order: column.order,
        name: column.name,
        themeColor: column.themeColor,
        tasks: column.tasks, 
        isChanged: false,
      }))
    );
  }, [columns]);

  const handleAddNewColumn = async () => {
    if (user?.uid) {
        try {
        const columnID = uuidv4(); // Generate a unique ID for the new column
        const newColumn = {
            id: columnID, 
            name: 'New Column',
            themeColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
            tasks: [],
            order: columns.length + 1, // Set index based on current length
        };

        // Add new column to Firestore using the utility function
        await addColumnToFirestore(user.uid, columnID, newColumn);

        // Update Redux state
        dispatch(
            addColumn({
                columnId: columnID,
                name: newColumn.name,
                themeColor: newColumn.themeColor,
                tasks: [],
            })
        );

        // Update local state to reflect changes immediately
        setColumnEdits((prevEdits) => [
            ...prevEdits,
            {
            id: columnID,
            order: prevEdits.length + 1,
            name: newColumn.name,
            themeColor: newColumn.themeColor,
            tasks: [],
            isChanged: false,
            },
        ]);
        } catch (error) {
          console.error('Error adding new column:', error);
        }
    }
    };

  const handleDelete = async () => {
    if (selectedColumnId && user?.uid) {
      await deleteColumnFromFirestore(user.uid, selectedColumnId);
      dispatch(deleteColumn({ columnId: selectedColumnId }));
      setConfirmationOpen(false);
      setSelectedColumnId(null);
    }
  };

  const handleOpenConfirmation = (columnId: string) => {
    setSelectedColumnId(columnId);
    setConfirmationOpen(true);
  };

  const handleCloseConfirmation = () => {
    setConfirmationOpen(false);
    setSelectedColumnId(null);
  };

  const handleNameChange = (columnId: string, newName: string) => {
    setColumnEdits((prevEdits) =>
      prevEdits.map((col) =>
        col.id === columnId ? { ...col, name: newName, isChanged: true } : col
      )
    );
  };

  const handleColorChange = (columnId: string, newColor: string) => {
    setColumnEdits((prevEdits) =>
      prevEdits.map((col) =>
        col.id === columnId ? { ...col, themeColor: newColor, isChanged: true } : col
      )
    );
  };

  const handleCloseDialog = async () => {
    if (user?.uid) {
      try {
        // Update all modified columns and save their order
        const modifiedColumns = columnEdits.filter(
          (col) =>
            col.isChanged ||
            col.name.trim() !== columns.find((original) => original.id === col.id)?.name.trim() ||
            col.themeColor !== columns.find((original) => original.id === col.id)?.themeColor ||
            col.order !== columns.find((original) => original.id === col.id)?.order
        );

        for (const column of modifiedColumns) {
          await updateColumnInFirestore(user.uid, column.id, column.name.trim(), column.order, column.themeColor);
          dispatch(updateColumn({ columnId: column.id, name: column.name.trim(), themeColor: column.themeColor, order: column.order }));
        }
      } catch (error) {
        console.error('Error updating columns:', error);
      }
    }

    // Close the dialog
    onClose();
  };

  // const moveColumn = (dragIndex: number, hoverIndex: number) => {
  //   const draggedColumn = columnEdits[dragIndex];
  //   const updatedColumns = [...columnEdits];
  //   updatedColumns.splice(dragIndex, 1);
  //   updatedColumns.splice(hoverIndex, 0, draggedColumn);

  //   // Update the order field for all columns
  //   updatedColumns.forEach((col, index) => {
  //     col.order = index + 1;
  //   });

  //   setColumnEdits(updatedColumns);
  // };

  const sortedColumns = columnEdits.sort((a, b) => a.order - b.order); // Sort columns by order
  
  const hasChanges = columnEdits.some(
    (col) =>
      col.name.trim() !== columns.find((original) => original.id === col.id)?.name.trim() ||
      col.themeColor !== columns.find((original) => original.id === col.id)?.themeColor
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <Dialog open={open} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>Manage Columns</DialogTitle>
        <DialogContent>
          {sortedColumns.length === 0 ? (
            <div className="text-center text-gray-500 mb-4">
              No columns! How about we add one?
            </div>
          ) : (
            sortedColumns.map((column, index) => (
              <div className={`flex items-center space-x-4 mb-4`}>
                {/* <IconButton>
                  <DragIcon />
                </IconButton> */}
                <input
                  type="color"
                  value={column.themeColor}
                  onChange={(e) => handleColorChange(column.id, e.target.value)}
                  className="w-10 h-10 border rounded"
                />
                <TextField
                  value={column.name}
                  onChange={(e) => handleNameChange(column.id, e.target.value)}
                  variant="outlined"
                  size="small"
                  className="flex-grow"
                />
                <IconButton onClick={() => handleOpenConfirmation(column.id)}>
                  <DeleteIcon />
                </IconButton>
              </div>

              // <DraggableColumn
              //   key={column.id}
              //   column={column}
              //   index={index}
              //   moveColumn={moveColumn}
              //   handleNameChange={handleNameChange}
              //   handleColorChange={handleColorChange}
              //   handleOpenConfirmation={handleOpenConfirmation}
              // />
            ))
          )}
          <Button
            onClick={handleAddNewColumn}
            disabled={columns.length >= 3} // Current limit is 3 colums max
            className="mt-4"
            fullWidth
          >
            {columns.length >= 10 ? 'Maximum 10 columns added' : 'Add New Column'}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {hasChanges ? 'Save and Close' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationOpen} onClose={handleCloseConfirmation}>
        <DialogTitle>Delete Column</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this column? All tasks in this column will be deleted.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmation}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DndProvider>
  );
};

// const DraggableColumn: React.FC<{
//   column: EditableColumnType;
//   index: number;
//   moveColumn: (dragIndex: number, hoverIndex: number) => void;
//   handleNameChange: (columnId: string, newName: string) => void;
//   handleColorChange: (columnId: string, newColor: string) => void;
//   handleOpenConfirmation: (columnId: string) => void;
// }> = ({ column, index, moveColumn, handleNameChange, handleColorChange, handleOpenConfirmation }) => {
//   const ref = useRef<HTMLDivElement>(null);

//   const [, drop] = useDrop({
//     accept: 'COLUMN',
//     hover: (draggedItem: { index: number }, monitor) => {
//       if (!ref.current) return;

//       const dragIndex = draggedItem.index;
//       const hoverIndex = index;

//       if (dragIndex === hoverIndex) return; // Do nothing if the item is hovering over itself

//       // Get the bounding rectangle of the drop target
//       const hoverBoundingRect = ref.current.getBoundingClientRect();

//       // Get the vertical middle of the drop target
//       const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

//       // Get the mouse position
//       const clientOffset = monitor.getClientOffset();

//       if (!clientOffset) return;

//       // Calculate the mouse position relative to the drop target
//       const hoverClientY = clientOffset.y - hoverBoundingRect.top;

//       // Only reorder if the mouse is past the middle of the drop target
//       if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
//       if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

//       // Perform the reordering
//       moveColumn(dragIndex, hoverIndex);

//       // Update the dragged item's index
//       draggedItem.index = hoverIndex;
//     },
//   });

//   const [{ isDragging }, drag] = useDrag({
//     type: 'COLUMN',
//     item: { index },
//     collect: (monitor) => ({
//       isDragging: monitor.isDragging(),
//     }),
//   });

//   drag(drop(ref));

//   return (
//     <div
//       ref={ref}
//       className={`flex items-center space-x-4 mb-4 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
//     >
//       <IconButton>
//         <DragIcon />
//       </IconButton>
//       <input
//         type="color"
//         value={column.themeColor}
//         onChange={(e) => handleColorChange(column.id, e.target.value)}
//         className="w-10 h-10 border rounded"
//       />
//       <TextField
//         value={column.name}
//         onChange={(e) => handleNameChange(column.id, e.target.value)}
//         variant="outlined"
//         size="small"
//         className="flex-grow"
//       />
//       <IconButton onClick={() => handleOpenConfirmation(column.id)}>
//         <DeleteIcon />
//       </IconButton>
//     </div>
//   );
// };

export default ManageColumnsDialog;