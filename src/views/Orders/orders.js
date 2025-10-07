import React, { useState } from 'react';
import OrdersList from './OrdersList';
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, IconButton, Slide } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AddOrdersForm from './AddOrdersForm';

const Orders = () => {
  const [openAddOrderDialog, setOpenAddOrderDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddOrder = () => {
    setOpenAddOrderDialog(true);
  };
  const handleCloseAddOrderDialog = () => {
    setOpenAddOrderDialog(false);
    // Refresh the orders list when closing the dialog
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <OrdersList filterSize={6} searchSize={12} key={refreshKey} onAddOrder={handleAddOrder} />

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