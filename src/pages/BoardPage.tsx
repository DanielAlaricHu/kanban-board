import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// Firebase
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
// MUI
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import CircularProgress from '@mui/material/CircularProgress'; 
import { useMediaQuery } from '@mui/material';
// Redux
import { useSelector, useDispatch } from 'react-redux';
import { fetchColumns } from '../features/columnsThunks';
import { resetColumns } from '../features/columnsSlice';
import { AppDispatch } from '../store/store';
// Types
import { ColumnType } from '../types/ColumnType';
// Components
import Column from '../components/Column';
import TaskDialog from '../components/TaskDialog';
import ManageColumnsDialog from '../components/ManageColumnsDialog';
// Context
import { useAuth } from '../context/AuthContext';

const BoardPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const columns = useSelector((state: { columns: ColumnType[] }) => state.columns);
  // Loading and error
  const [isLoading, setIsLoading] = useState(true);
  const [profilePicError, setProfilePicError] = useState(false);
  // Dialog
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openNewTaskDialog, setOpenNewTaskDialog] = useState(false);
  const [openManageColumnsDialog, setOpenManageColumnsDialog] = useState(false);
  // Task dialog state
  const [newTaskState, setNewTaskState] = useState('');
  // Other
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isSmallScreen = useMediaQuery('(max-width:640px)');

  // Fetch columns from Firestore, inital
  useEffect(() => {
    if (user?.uid) {
      setIsLoading(true);
      dispatch(fetchColumns(user.uid)).finally(() => {
        setIsLoading(false); 
      });
    }
  }, [user]);

  // Sort columns by order
  const sortedColumns = useSelector((state: { columns: ColumnType[] }) =>
    [...state.columns].sort((a, b) => a.order - b.order) 
  );

  // ------------------------------------------------------------
  // Handle new task dialog 

  const handleOpenNewTaskDialog = (defaultState: string) => {
    setNewTaskState(defaultState); // Example: + clicked in To Do column, show To Do in state by default
    setOpenNewTaskDialog(true);
  };

  const handleCloseNewTaskDialog = () => {
    setOpenNewTaskDialog(false);
  };

  // ------------------------------------------------------------
  // Handle manage column dialog 

  const handleOpenManageColumns = () => {
    setOpenManageColumnsDialog(true);
  };

  const handleCloseManageColumnsDialog = () => {
    setOpenManageColumnsDialog(false);
  };

  // ------------------------------------------------------------
  // Handle profile context menu

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(resetColumns());
    } catch (error) {
      console.error('Error logging out:', error);
    }
    handleMenuClose();
  };

  // ------------------------------------------------------------
  // Handle sidebar

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // ------------------------------------------------------------
  // Render

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="h-[100vh] p-4 flex flex-col">
      <header className="font-KuaiLe sm:text-3xl text-xl font-bold mb-4 flex justify-between items-center sm:text-xl">
        <span>看板·板 | Kanban Board</span>
        <div className="hidden sm:flex items-center space-x-4">
          {!isSmallScreen && (
            <Button
              variant="outlined"
              onClick={handleOpenManageColumns}
              sx={{
                color: 'black',
                borderColor: 'black',
                '&:hover': {
                  color: 'white',
                  backgroundColor: 'black',
                },
              }}
            >
              Manage Columns
            </Button>
          )}
          <IconButton onClick={handleProfileClick}>
            {user?.photoURL && !profilePicError ? (
              <img
                src={user.photoURL}
                alt="Profile"
                style={{ width: 40, height: 40, borderRadius: '50%' }}
                onError={() => setProfilePicError(true)}
              />
            ) : (
              <AccountCircleIcon fontSize="large" />
            )}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </div>
        {isSmallScreen && (
          <IconButton onClick={toggleSidebar}>
            <MenuIcon fontSize="large" />
          </IconButton>
        )}
      </header>

      {/* Sidebar for mobile view */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-white z-50 flex flex-col p-4 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <IconButton>
            {user?.photoURL && !profilePicError ? (
              <img
                src={user.photoURL}
                alt="Profile"
                style={{ width: 40, height: 40, borderRadius: '50%' }}
                onError={() => setProfilePicError(true)}
              />
            ) : (
              <AccountCircleIcon fontSize="large" />
            )}
          </IconButton>
          <IconButton onClick={toggleSidebar}>
            <ArrowBackIcon fontSize="large" />
          </IconButton>
        </div>

        <button
          onClick={handleOpenManageColumns}
          className="text-gray-700 text-left text-3xl hover:text-black mb-4"
        >
          Manage Columns
        </button>

        <div className="mt-auto">
          <hr className="border-t border-gray-300 my-4" />
          <button
            onClick={handleLogout}
            className="text-gray-700 text-left text-3xl hover:text-black"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Conditional rendering for empty columns */}
      {columns.length === 0 ? (
        // If there is no column, show call for action
        <div className="flex flex-col items-center justify-center flex-grow">
          <p className="text-gray-700 text-xl mb-4">Whoops! No columns available</p>
          <Button
            variant="contained"
            onClick={handleOpenManageColumns}
            sx={{
              backgroundColor: 'black',
              color: 'white',
              '&:hover': {
                backgroundColor: 'gray',
              },
            }}
          >
            Manage Columns
          </Button>
        </div>
      ) : (
        // If there are columns, render them
        <DndProvider backend={HTML5Backend}>
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-4 flex-grow">
            {sortedColumns.map((column) => (
              <Column
                key={column.id}
                id={column.id}
                order={column.order}
                name={column.name}
                themeColor={column.themeColor}
                tasks={column.tasks}
                onAddTask={handleOpenNewTaskDialog}
              />
            ))}
          </div>
        </DndProvider>
      )}

      <TaskDialog
        open={openNewTaskDialog}
        onClose={handleCloseNewTaskDialog}
        defaultState={newTaskState}
      />

      <ManageColumnsDialog
        open={openManageColumnsDialog}
        onClose={handleCloseManageColumnsDialog}
      />
    </div>
  );
};

export default BoardPage;