import React, { useState, useEffect } from 'react';
import {
  Dialog, AppBar, Toolbar, IconButton, Typography, Button, Box, TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const UpdateOrderModal = ({ open, onClose, order, onUpdate }) => {
  const [updatedData, setUpdatedData] = useState({
    deliveryAddress: { streetAddress: '', city: '', stateProvince: '', postalCode: '', country: '' },
    deliveryDate: '',
    comment: ''
  });

  // Populate fields when order changes

useEffect(() => {
  console.log('--- UpdateOrderModal Mounted / order changed ---');
  console.log('Received order prop:', order);

  if (!order) return;

  console.log('Order number:', order.orderno);
  console.log('Customer:', order.customer);
  console.log('Delivery string for table (deliveryAddress):', order.deliveryAddress);
  console.log('Full delivery object (deliveryaddress):', order.deliveryaddress);
  console.log('Delivery date:', order.deliverydate);
  console.log('Comment:', order.comment);
  console.log('Total amount:', order.totalamount);
  console.log('Status:', order.status);

  const formattedDate = order.deliverydate
    ? new Date(order.deliverydate).toISOString().split('T')[0]
    : '';

  const addr = order.deliveryaddress || {
  streetAddress:'', city:'', stateProvince:'', postalCode:'', country:''
};


  setUpdatedData({
    deliveryAddress: addr,
    deliveryDate: formattedDate,
    comment: order.comment || ''
  });

  console.log('Updated data state set in modal:', {
    deliveryAddress: addr,
    deliveryDate: formattedDate,
    comment: order.comment
  });

}, [order]);


  // Handle changes
  const handleChange = (field, value) => {
    setUpdatedData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setUpdatedData(prev => ({
      ...prev,
      deliveryAddress: { ...prev.deliveryAddress, [field]: value }
    }));
  };

  // Submit update
  const handleUpdateSubmit = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/orders/${order.orderno}`, updatedData);
      if (res.data.success) {
        // Return updated order to parent
        const updatedOrder = {
          ...order,
          deliveryaddress: { ...updatedData.deliveryAddress },
          deliverydate: updatedData.deliveryDate,
          comment: updatedData.comment
        };
        onUpdate(updatedOrder);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update order', err);
    }
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
            Update Order {order?.orderno}
          </Typography>
          <Button autoFocus color="inherit" onClick={handleUpdateSubmit}>
            Save
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        <TextField
          label="Street Address"
          value={updatedData.deliveryAddress.streetAddress}
          onChange={(e) => handleAddressChange('streetAddress', e.target.value)}
          fullWidth sx={{ mb: 2 }}
        />
        <TextField
          label="City"
          value={updatedData.deliveryAddress.city}
          onChange={(e) => handleAddressChange('city', e.target.value)}
          fullWidth sx={{ mb: 2 }}
        />
        <TextField
          label="State/Province"
          value={updatedData.deliveryAddress.stateProvince}
          onChange={(e) => handleAddressChange('stateProvince', e.target.value)}
          fullWidth sx={{ mb: 2 }}
        />
        <TextField
          label="Postal Code"
          value={updatedData.deliveryAddress.postalCode}
          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
          fullWidth sx={{ mb: 2 }}
        />
        <TextField
          label="Country"
          value={updatedData.deliveryAddress.country}
          onChange={(e) => handleAddressChange('country', e.target.value)}
          fullWidth sx={{ mb: 2 }}
        />
        <TextField
          label="Delivery Date"
          type="date"
          value={updatedData.deliveryDate}
          onChange={(e) => handleChange('deliveryDate', e.target.value)}
          fullWidth sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Comment"
          value={updatedData.comment}
          onChange={(e) => handleChange('comment', e.target.value)}
          multiline rows={4}
          fullWidth
        />
      </Box>
    </Dialog>
  );
};

export default UpdateOrderModal;
