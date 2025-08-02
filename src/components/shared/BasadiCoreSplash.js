import React from 'react';
import { Box, Typography, Fade } from '@mui/material';

const BasadiCoreSplash = ({ show }) => (
  <Fade in={show} timeout={800}>
    <Box
      sx={{
        position: 'fixed',
        zIndex: 3000,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.8s',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: 900,
          letterSpacing: 4,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          component="span"
          sx={{
            color: '#1976d2',
            textShadow: '0 4px 24px #90caf9, 0 1px 0 #fff',
            animation: 'basadiPulse 1.2s infinite alternate',
            '@keyframes basadiPulse': {
              from: { color: '#1976d2', textShadow: '0 4px 24px #90caf9, 0 1px 0 #fff' },
              to: { color: '#1565c0', textShadow: '0 4px 24px #1976d2, 0 1px 0 #1976d2' },
            },
          }}
        >
          Basadi
        </Box>
        <Box
          component="span"
          sx={{
            color: '#fff',
            ml: 1,
            textShadow: '0 4px 24px #1976d2, 0 1px 0 #1976d2',
            bgcolor: '#1976d2',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            fontWeight: 900,
            animation: 'corePulse 1.2s infinite alternate',
            '@keyframes corePulse': {
              from: { bgcolor: '#1976d2' },
              to: { bgcolor: '#1565c0' },
            },
          }}
        >
          Core
        </Box>
      </Typography>
    </Box>
  </Fade>
);

export default BasadiCoreSplash;