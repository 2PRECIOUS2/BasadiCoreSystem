import { CssBaseline, ThemeProvider } from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import { useRoutes, useLocation, useNavigate } from 'react-router-dom';
import Router from './routes/Router';
//import Box from '@mui/material/Box';
import BasadiCoreSplash from './components/shared/BasadiCoreSplash';
import { createTheme } from '@mui/material/styles';
import MSidebar from './layouts/full/sidebar/Sidebar';

function App() {
  const [mode, setMode] = useState('light');
  const [showSplash, setShowSplash] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // for testing, set true initially

  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/auth/login' || location.pathname === '/auth/register';
  // Memoized theme to prevent unnecessary re-renders
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark' && {
            background: { default: '#181C32', paper: '#23263A' },
          }),
        },
        typography: { fontSize: 14 },
      }),
    [mode]
  );

  // splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // redirect to login if not signed in
  useEffect(() => {
    if (!showSplash) {
      const isAuthPage = location.pathname === '/login' || location.pathname === '/auth/login' || location.pathname === '/auth/register';
      if (!isAuthenticated && !isAuthPage) {
        navigate('/auth/login');
      }
    }
  }, [showSplash, navigate, location, isAuthenticated]);

  const routing = useRoutes(Router);

  return (
    <ThemeProvider theme={theme}>
      <BasadiCoreSplash show={showSplash} />
      <CssBaseline />

      {/* Show sidebar only when logged in */}
      {isAuthenticated &&  !isAuthPage && (
        <MSidebar
          mode={mode}
          setMode={setMode}
          isSidebarOpen={isSidebarOpen}
          onSidebarClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Render routes, pass setIsAuthenticated so login page can call it */}
      {!showSplash && React.cloneElement(routing, { setIsAuthenticated })}
    </ThemeProvider>
  );
}

export default App;
