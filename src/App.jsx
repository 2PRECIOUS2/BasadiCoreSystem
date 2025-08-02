// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

import { CssBaseline, ThemeProvider } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import Router from './routes/Router';
import BasadiCoreSplash from './components/shared/BasadiCoreSplash';

import { baselightTheme } from "./theme/DefaultColors";

function App() {
  
  const routing = useRoutes(Router);
  const theme = baselightTheme;

    const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200); // 1.2 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <BasadiCoreSplash show={showSplash} />
      <CssBaseline />
      {!showSplash && <>{routing}</>}
    </ThemeProvider>
  );
}

export default App