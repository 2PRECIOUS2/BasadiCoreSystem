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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ fontWeight: 700, minWidth: 180 }}
          startIcon={<AddIcon />}
          onClick={handleAddOrder}
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