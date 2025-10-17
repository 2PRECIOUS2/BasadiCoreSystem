import { CssBaseline, ThemeProvider } from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import { useRoutes, useLocation, useNavigate } from 'react-router-dom';
import Router from './routes/Router';
import BasadiCoreSplash from './components/shared/BasadiCoreSplash';
import SessionWatcher from './components/SessionWatcher';
import { createTheme } from '@mui/material/styles';

function App() {
  const [mode, setMode] = useState('light');
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); // ✅ Auth check state

  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/auth/login' || location.pathname === '/auth/register';

  // Memoized theme
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

  // ------------------ Splash Screen ------------------
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // ------------------ Check Auth Session ------------------
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/check-session', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.active);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true); // ✅ mark auth check complete
      }
    };

    checkAuthStatus();
  }, []);

  // ------------------ Redirect if not authenticated ------------------
  useEffect(() => {
    if (!showSplash && authChecked && !isAuthenticated && !isAuthPage) {
      navigate('/auth/login');
    }
  }, [showSplash, authChecked, isAuthenticated, isAuthPage, navigate]);

  // ------------------ Prepare routes ------------------
  const routing = useRoutes(Router);

  // Prevent rendering app until auth is checked
  if (!authChecked) return null; // or a loading spinner

  return (
    <ThemeProvider theme={theme}>
      {/* Splash */}
      <BasadiCoreSplash show={showSplash} />

      <CssBaseline />

      {/* Session watcher */}
      {isAuthenticated && !showSplash && !isAuthPage && (
        <SessionWatcher setIsAuthenticated={setIsAuthenticated} />
      )}

      {/* Render routes */}
      {!showSplash && React.cloneElement(routing, { setIsAuthenticated, mode, setMode })}
    </ThemeProvider>
  );
}

export default App;
