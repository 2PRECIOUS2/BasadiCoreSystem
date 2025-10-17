import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CakeIcon from '@mui/icons-material/Cake';
import BadgeIcon from '@mui/icons-material/Badge';
import PublicIcon from '@mui/icons-material/Public';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from 'src/config';


const CustomerProfile = ({ open, onClose, customer }) => {

const [orderCount, setOrderCount] = useState(0);
const [amountSpent, setAmountSpent] = useState(0);

  useEffect(() => {
    if (!customer) return;
    console.log('CustomerProfile received customer:', customer);
    const customerId = customer?.id || customer?.customerNumber || customer?.cust_id;
    console.log('Fetching stats for customerId:', customerId);

    if (customerId) {
      axios.get(`${API_BASE_URL}/api/customers/${customerId}/amount-spent`)
        .then(res => {
          if (res.data.success) setAmountSpent(res.data.amountSpent);
        });
      axios.get(`${API_BASE_URL}/api/customers/${customerId}/order-count`)
        .then(res => {
          if (res.data.success) setOrderCount(res.data.orderCount);
        });
    }
  }, [customer]);

  if (!customer) return null;


  // Format date of birth for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateString) => {
    if (!dateString) return null;
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return null;
    }
  };

  // Get full address string
  const getFullAddress = () => {
    const addressParts = [];
    if (customer.streetAddress || customer.streetaddress) {
      addressParts.push(customer.streetAddress || customer.streetaddress);
    }
    if (customer.city) addressParts.push(customer.city);
    if (customer.stateProvince || customer.stateprovince) {
      addressParts.push(customer.stateProvince || customer.stateprovince);
    }
    if (customer.postalCode || customer.postalcode) {
      addressParts.push(customer.postalCode || customer.postalcode);
    }
    if (customer.country) addressParts.push(customer.country);
    
    return addressParts.length > 0 ? addressParts.join(', ') : 'No address provided';
  };

  // Get phone display
  const getPhoneDisplay = () => {
    if (customer.phoneDisplay) return customer.phoneDisplay;
    if (customer.phone) return customer.phone;
    
    const countryCode = customer.countryCode || customer.countrycode || '';
    const phonePrefix = customer.phonePrefix || customer.phoneprefix || '';
    const phoneNumber = customer.phoneNumber || customer.phonenumber || '';
    
    if (countryCode && phonePrefix && phoneNumber) {
      return `+${countryCode} ${phonePrefix} ${phoneNumber}`;
    } else if (phonePrefix && phoneNumber) {
      return `${phonePrefix} ${phoneNumber}`;
    } else if (phoneNumber) {
      return phoneNumber;
    }
    
    return 'N/A';
  };

  const age = calculateAge(customer.dateOfBirth || customer.dateofbirth);
  

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 50,
              height: 50,
              bgcolor: customer.profileColor || customer.profilecolor || '#FF6B6B',
              fontSize: '20px',
              fontWeight: 'bold'
            }}
          >
            {customer.initials || 'UC'}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              {customer.fullName || customer.customerName || customer.customername || 'Unknown Customer'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Customer #{customer.cust_id}

            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Status Chip */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
            <Chip
              label={customer.status || 'Active'}
              sx={{
                textTransform: 'capitalize',
                backgroundColor: customer.statusBackground || customer.statusbackground || '#E8F5E8',
                color: customer.statusColor || customer.statuscolor || '#4CAF50',
                border: `1px solid ${customer.statusColor || customer.statuscolor || '#4CAF50'}`,
                fontWeight: 600,
                fontSize: '12px',
                height: 28
              }}
            />
          </Box>

          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 2,
                    color: 'primary.main',
                    fontWeight: 600
                  }}>
                    <PersonIcon /> Personal Information
                  </Typography>
                  
                  <Box sx={{ space: 2 }}>
                    {/* First Name */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        First Name
                      </Typography>
                      <Typography variant="body1">
                        {customer.firstName || customer.firstname || 'N/A'}
                      </Typography>
                    </Box>

                    {/* Last Name */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Last Name
                      </Typography>
                      <Typography variant="body1">
                        {customer.lastName || customer.lastname || 'N/A'}
                      </Typography>
                    </Box>

                    {/* Date of Birth */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CakeIcon fontSize="small" /> Date of Birth
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(customer.dateOfBirth || customer.dateofbirth)}
                        {age && (
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({age} years old)
                          </Typography>
                        )}
                      </Typography>
                    </Box>

                    {/* Gender */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Gender
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {customer.gender || 'Not specified'}
                      </Typography>
                    </Box>

                    {/* Customer ID */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BadgeIcon fontSize="small" /> Customer ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {customer.customerNumber || customer.customernumber || customer.id}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 2,
                    color: 'primary.main',
                    fontWeight: 600
                  }}>
                    <EmailIcon /> Contact Information
                  </Typography>
                  
                  <Box sx={{ space: 2 }}>
                    {/* Email */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Email Address
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                        {customer.email || 'N/A'}
                      </Typography>
                    </Box>

                    {/* Phone */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" /> Phone Number
                      </Typography>
                      <Typography variant="body1">
                        {getPhoneDisplay()}
                      </Typography>
                    </Box>

                    {/* Country Code */}
                    {(customer.countryCode || customer.countrycode) && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PublicIcon fontSize="small" /> Country Code
                        </Typography>
                        <Typography variant="body1">
                          +{customer.countryCode || customer.countrycode}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Address Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 2,
                    color: 'primary.main',
                    fontWeight: 600
                  }}>
                    <LocationOnIcon /> Address Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* Street Address */}
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Street Address
                        </Typography>
                        <Typography variant="body1">
                          {customer.streetAddress || customer.streetaddress || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* City */}
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          City
                        </Typography>
                        <Typography variant="body1">
                          {customer.city || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* State/Province */}
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          State/Province
                        </Typography>
                        <Typography variant="body1">
                          {customer.stateProvince || customer.stateprovince || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Postal Code */}
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Postal Code
                        </Typography>
                        <Typography variant="body1">
                          {customer.postalCode || customer.postalcode || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Country */}
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Country
                        </Typography>
                        <Typography variant="body1">
                          {customer.country || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Full Address */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Complete Address
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50', mt: 1 }}>
                          <Typography variant="body1">
                            {getFullAddress()}
                          </Typography>
                        </Paper>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                    Additional Information
                  </Typography>
                  <Grid container spacing={3}>
                    {/* Total Orders */}
                    <Grid item xs={12} sm={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Total Orders
                        </Typography>
                        <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                          {orderCount}
                        </Typography>
                      </Box>
                    </Grid>
                    {/* Amount Spent */}
                    <Grid item xs={12} sm={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Amount Spent
                        </Typography>
                        <Typography variant="h4" color="primary.main" sx={{ fontWeight: 600 }}>
                          R{amountSpent.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    {/* Account Status */}
                    <Grid item xs={12} sm={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Account Status
                        </Typography>
                        <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 600, mt: 0.5 }}>
                          {customer.status || 'Active'}
                        </Typography>
                      </Box>
                    </Grid>
                    {/* Location Summary */}
                    <Grid item xs={12} sm={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Location
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 0.5 }}>
                          {customer.location || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerProfile;