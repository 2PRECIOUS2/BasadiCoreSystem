import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import InfoIcon from '@mui/icons-material/Info';
import CustomerProfile from './CustomerProfile';

const CustomersList = ({ customers, onEdit, onArchive, onRestore }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('name');
  const [showArchived, setShowArchived] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success' // 'success', 'error', 'warning', 'info'
});

  const handleMenuClick = (event, customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const handleEdit = () => {
    if (selectedCustomer) {
      // Format the customer data to match what the edit dialog expects
      const formattedCustomer = {
        id: selectedCustomer.customerNumber || selectedCustomer.id,
        firstName: selectedCustomer.firstname || selectedCustomer.firstName,
        lastName: selectedCustomer.lastname || selectedCustomer.lastName,
        email: selectedCustomer.email,
        phoneNumber: selectedCustomer.phonenumber || selectedCustomer.phoneNumber,
        countryCode: selectedCustomer.countrycode || selectedCustomer.countryCode,
        phonePrefix: selectedCustomer.phoneprefix || selectedCustomer.phonePrefix,
        streetAddress: selectedCustomer.streetaddress || selectedCustomer.streetAddress,
        city: selectedCustomer.city,
        stateProvince: selectedCustomer.stateprovince || selectedCustomer.stateProvince,
        postalCode: selectedCustomer.postalcode || selectedCustomer.postalCode,
        country: selectedCustomer.country,
        dateOfBirth: selectedCustomer.dateofbirth || selectedCustomer.dateOfBirth,
        gender: selectedCustomer.gender,
        status: selectedCustomer.status,
        ...selectedCustomer
      };
      
      console.log('🔧 Formatted customer data for edit:', formattedCustomer);
      onEdit(formattedCustomer);
    }
    handleMenuClose();
  };

 

// Update your handleViewDetails function

const handleViewDetails = () => {
    if (selectedCustomer) {
      setProfileOpen(true);
    }
    handleMenuClose();
  };
// Add this function to handle profile modal close
const handleProfileClose = () => {
  setProfileOpen(false);
  setSelectedCustomer(null);
};


  const handleArchive = () => {
      if (selectedCustomer) {
    // Check if customer has orders
    const orderCount = selectedCustomer.orders || 0;
    
    
      if (orderCount > 0) {
      setSnackbar({
        open: true,
        message: `Cannot archive customer with ${orderCount} active orders. Please complete or cancel all orders first.`,
        severity: 'warning'
      });
      handleMenuClose();
      return;
    }

    if (window.confirm('Are you sure you want to archive this customer? They will be hidden from the main customer list.')) {
      // Show loading message
      setSnackbar({
        open: true,
        message: 'Archiving customer...',
        severity: 'info'
      });
      
      onArchive(selectedCustomer.customerNumber || selectedCustomer.id);
    }
  }
  handleMenuClose();
  };


  const handleRestore = () => {
  if (selectedCustomer && window.confirm('Are you sure you want to restore this customer?')) {
    // Show loading message
    setSnackbar({
      open: true,
      message: 'Restoring customer...',
      severity: 'info'
    });
    
    if (onRestore) {
      onRestore(selectedCustomer.customerNumber || selectedCustomer.id);
    }
  }
  handleMenuClose();
};

// Add snackbar close handler
const handleSnackbarClose = (event, reason) => {
  if (reason === 'clickaway') {
    return;
  }
  setSnackbar({ ...snackbar, open: false });
};

// Add this function to be called by parent component when operations complete
const showNotification = (message, severity = 'success') => {
  setSnackbar({
    open: true,
    message,
    severity
  });
};

  const filteredCustomers = customers.filter(customer => {
     
     const isArchived = customer.status === 'archived';
    if (showArchived && !isArchived) return false;
    if (!showArchived && isArchived) return false;

    const searchValue = searchTerm.toLowerCase();
    if (!searchValue) return true;

    switch (filterBy) {
      case 'name':
        return customer.fullName?.toLowerCase().includes(searchValue) || 
               customer.customerName?.toLowerCase().includes(searchValue) ||
               customer.customername?.toLowerCase().includes(searchValue) ||
               `${customer.firstName || customer.firstname || ''} ${customer.lastName || customer.lastname || ''}`.toLowerCase().includes(searchValue);
      case 'email':
        return customer.email?.toLowerCase().includes(searchValue);
      case 'location':
        return customer.location?.toLowerCase().includes(searchValue);
      case 'status':
        return customer.status?.toLowerCase().includes(searchValue);
      default:
        return true;
    }
  });

  // Debug: Log customer data to see what's available
  console.log('Customers data:', customers);
  console.log('Filtered customers:', filteredCustomers);

  return (
      <Box>
    {/* REPLACE THIS ENTIRE SECTION (lines 127-158) */}
    {/* Search and Filter Controls */}
   

    {/* WITH THE NEW ENHANCED VERSION */}
    {/* Search and Filter Controls */}
    <Box sx={{ display: 'flex', gap: 3, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Archive Toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={showArchived ? "Archived Customers" : "Active Customers"}
          variant={showArchived ? "filled" : "outlined"}
          onClick={() => setShowArchived(!showArchived)}
          sx={{ 
            cursor: 'pointer',
            bgcolor: showArchived ? 'warning.main' : 'primary.main',
            color: showArchived ? 'warning.contrastText' : 'primary.contrastText',
            '&:hover': {
              bgcolor: showArchived ? 'warning.dark' : 'primary.dark'
            }
          }}
        />
      
      </Box>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Filter by</InputLabel>
        <Select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          label="Filter by"
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="email">Email</MenuItem>
          <MenuItem value="location">Location</MenuItem>
          <MenuItem value="status">Status</MenuItem>
        </Select>
      </FormControl>

      <TextField
        size="small"
        placeholder={`Search by ${filterBy}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ flexGrow: 1, maxWidth: 300, maxWidth: '100%'}}
      />
    </Box>

      {/* Customers Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Customer Number</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Orders</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => {
                // Enhanced debug logging
                console.log('🔍 Full customer object:', customer);
                console.log('🔍 Available keys:', Object.keys(customer));
                
                // Try all possible field name variations
                const customerName = customer.fullName || 
                                   customer.customerName || 
                                   customer.customername ||
                                   `${customer.firstName || customer.firstname || ''} ${customer.lastName || customer.lastname || ''}`.trim() ||
                                   'Unknown Customer';
                                   
                const customerNumber = customer.customerNumberDisplay || 
                                     customer.customernumberdisplay || 
                                     customer.customerNumber ? `#${customer.customerNumber}` :
                                     customer.customernumber ? `#${customer.customernumber}` :
                                     customer.id ? `#${customer.id}` :
                                     '#0';
                                     
                const initials = customer.initials || 
                               (customer.firstName && customer.lastName ? 
                                `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}` :
                                customer.firstname && customer.lastname ?
                                `${customer.firstname.charAt(0)}${customer.lastname.charAt(0)}` :
                                'UC');

                console.log('✅ Customer name resolved to:', customerName);
                console.log('✅ Customer number resolved to:', customerNumber);
                console.log('✅ Customer initials resolved to:', initials);

                const getLocationDisplay = () => {
                  if (customer.location) {
                    const parts = customer.location.split(', ');
                    if (parts.length >= 2) {
                      const city = parts[0];
                      const country = parts[parts.length - 1];
                      return (
                        <Box>
                          <Typography variant="body2" sx={{ lineHeight: 1.2, fontSize: '13px' }}>
                            {city}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                            {country}
                          </Typography>
                        </Box>
                      );
                    }
                  }
                  return 'N/A';
                };

                return (
                  <TableRow 
                    key={customer.customerNumberDisplay || customer.customernumberdisplay || Math.random()}
                    hover
                    sx={{ cursor: 'pointer' }}
                  >
                    {/* Customer Number */}
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color="primary.main">
                        {customerNumber}
                      </Typography>
                    </TableCell>

                    {/* Customer Name with Avatar */}
                    <TableCell>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5
                      }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: customer.profileColor || customer.profilecolor || '#FF6B6B',
                            width: 32,
                            height: 32,
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Typography 
                          variant="body2" 
                          fontWeight="600"
                        >
                          {customerName}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {customer.email || 'N/A'}
                      </Typography>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      {getLocationDisplay()}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        label={customer.status || 'Active'}
                        size="small"
                        sx={{ 
                          textTransform: 'capitalize',
                          backgroundColor: customer.statusBackground || customer.statusbackground || '#E8F5E8',
                          color: customer.statusColor || customer.statuscolor || '#4CAF50',
                          border: `1px solid ${customer.statusColor || customer.statuscolor || '#4CAF50'}`,
                          fontWeight: 500,
                          fontSize: '11px',
                          height: 24
                        }}
                      />
                    </TableCell>

                    {/* Orders */}
                    <TableCell>
                      <Typography variant="body2">
                        {customer.orders || 0}
                      </Typography>
                    </TableCell>

                    {/* Action Menu */}
                    <TableCell align="center">
                      <IconButton
                        onClick={(event) => handleMenuClick(event, customer)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
        
<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleMenuClose}
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'right',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'right',
  }}
>
  {/* Convert Fragment to array - this fixes the MUI error */}
  {selectedCustomer?.status === 'archived' ? [
    // Archived customer - only show More Info and Restore
    <MenuItem key="info" onClick={handleViewDetails}>
      <InfoIcon sx={{ mr: 1 }} fontSize="small" />
      More Info
    </MenuItem>,
    <MenuItem key="restore" onClick={handleRestore} sx={{ color: 'success.main' }}>
      <RestoreIcon sx={{ mr: 1 }} fontSize="small" />
      Restore Customer
    </MenuItem>
  ] : [
    // Active customer - show More Info, Edit, and Archive
    <MenuItem key="info" onClick={handleViewDetails}>
      <InfoIcon sx={{ mr: 1 }} fontSize="small" />
      More Info
    </MenuItem>,
    <MenuItem key="edit" onClick={handleEdit}>
      <EditIcon sx={{ mr: 1 }} fontSize="small" />
      Edit
    </MenuItem>,
    <MenuItem 
      key="archive"
      onClick={handleArchive} 
      sx={{ 
        color: (selectedCustomer?.orders || 0) > 0 ? 'text.disabled' : 'warning.main'
      }}
      disabled={(selectedCustomer?.orders || 0) > 0}
    >
      <ArchiveIcon sx={{ mr: 1 }} fontSize="small" />
      Archive
      {(selectedCustomer?.orders || 0) > 0 && (
        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
          ({selectedCustomer?.orders} orders)
        </Typography>
      )}
    </MenuItem>
  ]}
</Menu>

       <CustomerProfile 
        open={profileOpen}
        onClose={handleProfileClose}
        customer={selectedCustomer}
      />
      <Snackbar
  open={snackbar.open}
  autoHideDuration={6000}
  onClose={handleSnackbarClose}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
>
  <Alert
    onClose={handleSnackbarClose}
    severity={snackbar.severity}
    variant="filled"
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
    </Box>
  );
};

export default CustomersList;