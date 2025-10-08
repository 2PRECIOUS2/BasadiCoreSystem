import React, { useState, useEffect } from 'react';
import {
  Dialog, AppBar, Toolbar, IconButton, Typography, Button, Box, TextField,
  Card, CardContent, Grid, Divider, InputAdornment, Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CommentIcon from '@mui/icons-material/Comment';
import axios from 'axios';
import { API_BASE_URL } from 'src/config';

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
  if (!order || !order.orderno) return;

  try {
    const res = await axios.put(
      `${API_BASE_URL}/api/orders/${order.orderno}`,
      updatedData,
      { withCredentials: true } // send session cookies
    );

    if (res.data.success) {
      // Return updated order to parent
      const updatedOrder = {
        ...order,
        deliveryaddress: { ...updatedData.deliveryAddress },
        deliverydate: updatedData.deliveryDate,
        comment: updatedData.comment,
      };
      onUpdate(updatedOrder);
      onClose();
    } else {
      console.error('Update failed:', res.data.error || res.data.message);
    }
  } catch (err) {
    console.error('Failed to update order', err.response?.data || err.message);
  }
};

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar 
        sx={{ 
          position: 'relative',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={onClose}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" fontWeight={600}>
            Update Order #{order?.orderno}
          </Typography>
          <Button 
            autoFocus 
            color="inherit" 
            onClick={handleUpdateSubmit}
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Save Changes
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        p: 4, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Delivery Address Section */}
          <Fade in={true} timeout={600}>
            <Card elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <LocationOnIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Delivery Address
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Street Address"
                      value={updatedData.deliveryAddress.streetAddress}
                      onChange={(e) => handleAddressChange('streetAddress', e.target.value)}
                      fullWidth
                      multiline
                      rows={2}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 20px rgba(25,118,210,0.15)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="City"
                      value={updatedData.deliveryAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease'
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="State/Province"
                      value={updatedData.deliveryAddress.stateProvince}
                      onChange={(e) => handleAddressChange('stateProvince', e.target.value)}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease'
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Postal Code"
                      value={updatedData.deliveryAddress.postalCode}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease'
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Country"
                      value={updatedData.deliveryAddress.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Fade>

          {/* Delivery Date and Comment Section */}
          <Fade in={true} timeout={800}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)' }}>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <CalendarTodayIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Delivery Date
                      </Typography>
                    </Box>
                    <TextField
                      label="Delivery Date"
                      type="date"
                      value={updatedData.deliveryDate}
                      onChange={(e) => handleChange('deliveryDate', e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease'
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <CommentIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Order Comment
                      </Typography>
                    </Box>
                    <TextField
                      label="Comment"
                      value={updatedData.comment}
                      onChange={(e) => handleChange('comment', e.target.value)}
                      multiline
                      rows={4}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease'
                        }
                      }}
                      placeholder="Add any special instructions or notes for this order..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Fade>
        </Box>
      </Box>
    </Dialog>
  );
};

export default UpdateOrderModal;
