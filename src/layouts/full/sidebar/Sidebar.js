import React from 'react';
import { useMediaQuery, Box, Drawer, Switch, Typography, Divider } from '@mui/material';
import SidebarItems from './SidebarItems';
import { Sidebar } from 'react-mui-sidebar';
import Logo from '../shared/logo/Logo';

const MSidebar = ({ mode, setMode, isSidebarOpen, isMobileSidebarOpen, onSidebarClose }) => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const sidebarWidth = '270px';

  const handleModeToggle = () => {
    if (setMode) setMode(mode === 'light' ? 'dark' : 'light');
  };

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
          <Logo />
        </Box>
        <SidebarItems />
        <Divider sx={{ my: 2, mx: 3 }} />
      </Box>
      <Box sx={{ px: 3, pb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ color: mode === 'dark' ? '#fff' : '#222', mr: 1 }}>Dark Mode</Typography>
          <Switch
            checked={mode === 'dark'}
            onChange={() => setMode && setMode(mode === 'light' ? 'dark' : 'light')}
            disabled={!setMode}
          />
        </Box>
      </Box>
    </Box>
  );

  // Desktop Sidebar
  if (lgUp) {
    return (
      <Box sx={{ width: sidebarWidth, flexShrink: 0, overflow: 'hidden' }}>
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          PaperProps={{
            sx: { boxSizing: 'border-box', width: sidebarWidth, 
              overflow: 'hidden' },
          }}
        >
          <Sidebar
            key={mode} // 🔑 Force re-render on mode change
            width={sidebarWidth}
            collapsewidth="80px"
            open={isSidebarOpen}
            themeColor="#5d87ff"
            themeSecondaryColor="#49beff"
            showProfile={false}
          >
            {sidebarContent}
          </Sidebar>
        </Drawer>
      </Box>
    );
  }

  // Mobile Sidebar
  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      PaperProps={{
        sx: { boxSizing: 'border-box', width: sidebarWidth, overflow: 'hidden' },
      }}
    >
      <Sidebar
        key={mode} // 🔑 Force re-render on mode change
        width={sidebarWidth}
        collapsewidth="80px"
        open={isSidebarOpen}
        themeColor="#5d87ff"
        themeSecondaryColor="#49beff"
        showProfile={false}
      >
        {sidebarContent}
      </Sidebar>
    </Drawer>
  );
};

export default MSidebar;
