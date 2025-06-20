import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// Redux
import { Provider } from 'react-redux';
import store from './store/store';
// Context
import { AuthProvider, useAuth } from "./context/AuthContext";
// Pages
import HomePage from "./pages/HomePage";
import BoardPage from "./pages/BoardPage";
// MUI components
import { Box, CircularProgress } from "@mui/material";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Box className="min-h-screen flex justify-center items-center">
        <CircularProgress />
      </Box>
    );
  }
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Box className="min-h-screen flex justify-center items-center">
        <CircularProgress />
      </Box>
    );
  }
  return user ? <Navigate to="/board" replace /> : <>{children}</>;
};

const App: React.FC = () => (
  <div className="bg-gray-100 min-h-screen">
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <AuthRedirect>
                <HomePage />
              </AuthRedirect>
            }
          />
          <Route
            path="/board"
            element={
              <ProtectedRoute>
                <Provider store={store}>
                  <BoardPage />
                </Provider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  </div>
);

export default App;