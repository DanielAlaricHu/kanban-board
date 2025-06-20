import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// Custom types
import { ColumnType } from '../types/ColumnType';
import { TaskType } from '../types/TaskType';

const columnsSlice = createSlice({
  name: 'columns',
  initialState: [] as ColumnType[], 
  reducers: {
    setColumns: (state, action) => {
      // Replace the entire columns state
      return action.payload;
    },
    // -------------------------------------------------------------
    // Task related (tasks are in columns.tasks)
    addTask: (state, action) => {
      const { columnId, task } = action.payload;
      // Find the column using ID
      const column = state.find((col) => col.id === columnId);
      if (column) {
        // Found the column, push task
        column.tasks.push(task);
      }
    },
    removeTask: (state, action: PayloadAction<{ columnId: string; taskId: string }>) => {
      const column = state.find((col) => col.id === action.payload.columnId);
      if (column) {
        column.tasks = column.tasks.filter((task) => task.id !== action.payload.taskId);
      }
    },
    updateTask: (state, action: PayloadAction<{ columnId: string; task: TaskType }>) => {
      const { columnId, task } = action.payload;
      const column = state.find((col) => col.id === columnId);
      if (column) {
        const taskIndex = column.tasks.findIndex((t) => t.id === task.id);
        if (taskIndex !== -1) {
          column.tasks[taskIndex] = task;
        }
      }
    },
    moveTask: (state, action: PayloadAction<{ taskId: string; fromColumnId: string; toColumnId: string }>) => {
      const { taskId, fromColumnId, toColumnId } = action.payload;

      const fromColumn = state.find((col) => col.id === fromColumnId);
      const toColumn = state.find((col) => col.id === toColumnId);

      if (fromColumn && toColumn) {
        const task = fromColumn.tasks.find((task) => task.id === taskId);
        if (task) {
          // Remove the task from the original column
          fromColumn.tasks = fromColumn.tasks.filter((t) => t.id !== taskId);

          // Add the task to the new column
          toColumn.tasks.push(task);
        }
      }
    },
    // -------------------------------------------------------------
    // Column related
    addColumn: (state, action: PayloadAction<{ columnId: string; name: string; themeColor: string; tasks: TaskType[] }>) => {
      state.push({
        id: action.payload.columnId,            // Column ID
        order: state.length + 1,                // Column order
        name: action.payload.name,              // Column display name
        themeColor: action.payload.themeColor,  // Column theme color
        tasks: action.payload.tasks,            // Tasks in the column
      });
    },
    updateColumn: (state, action) => {
      const { columnId, name, themeColor, order } = action.payload;
      const column = state.find((col) => col.id === columnId);
      if (column) {
        column.name = name;
        column.themeColor = themeColor;
        column.order = order; 
      }
    },
    deleteColumn: (state, action: PayloadAction<{ columnId: string }>) => {
      return state.filter((column) => column.id !== action.payload.columnId);
    },
    resetColumns() {
      // Primarily used when logging out a user
      return [];
    },
  },
});

export const { setColumns, addTask, addColumn, updateColumn, removeTask, moveTask, updateTask, deleteColumn, resetColumns } = columnsSlice.actions;
export default columnsSlice.reducer;