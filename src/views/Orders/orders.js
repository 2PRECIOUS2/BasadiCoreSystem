import React, { useState } from 'react';
import OrdersList from './OrdersList';
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, IconButton, Slide } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AddOrdersForm from './AddOrdersForm';

const Orders = () => {
  const [openAddOrderDialog, setOpenAddOrderDialog] = useState(false);

  const handleAddOrder = () => {
    setOpenAddOrderDialog(true);
  };
  const handleCloseAddOrderDialog = () => {
    setOpenAddOrderDialog(false);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Manage Orders
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 2 }}>
        <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddOrder}
        sx={{
          py: 1.5,
          fontWeight: 600,
          letterSpacing: 1,
          fontSize: 18,
          borderRadius: 2,
          background: 'linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)',
          boxShadow: '0 2px 8px #90caf9',
          transition: 'transform 0.18s, box-shadow 0.18s',
          textTransform: 'none',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 16px #90caf9',
            background: 'linear-gradient(90deg, #1565c0 60%, #42a5f5 100%)'
          }
        }}
      >
        Add New Order
      </Button>
      </Box>
      <OrdersList filterSize={6} searchSize={12} />

      {/* Full Screen Add Order Dialog */}
      <Dialog
        open={openAddOrderDialog}
        onClose={handleCloseAddOrderDialog}
        fullScreen
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle>
          Add New Order
          <IconButton
            aria-label="close"
            onClick={handleCloseAddOrderDialog}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <AddOrdersForm />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Orders;