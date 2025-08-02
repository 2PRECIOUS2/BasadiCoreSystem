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
  InputLabel
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';

const CustomersList = ({ customers, onEdit, onArchive }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('name');

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
      onEdit(selectedCustomer);
    }
    handleMenuClose();
  };

  const handleArchive = () => {
  if (selectedCustomer && window.confirm('Are you sure you want to archive this customer?')) {
    onArchive(selectedCustomer.id); // Changed from onDelete
  }
  handleMenuClose();
};

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'subscribed':
        return 'success';
      case 'not subscribed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const filteredCustomers = customers.filter(customer => {
    const searchValue = searchTerm.toLowerCase();
    if (!searchValue) return true;

    switch (filterBy) {
      case 'name':
        return `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchValue);
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

  return (
    <Box>
      {/* Search and Filter Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
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
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
      </Box>

      {/* Customers Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell>Customer</TableCell>
              <TableCell>Email Subscription</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Amount Spent</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getInitials(customer.firstName, customer.lastName)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600">
                          {customer.firstName} {customer.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {customer.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={customer.status || 'Pending'}
                      color={getStatusColor(customer.status)}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {customer.location}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {customer.orders || 0} Orders
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      ${(customer.amountSpent || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(event) => handleMenuClick(event, customer)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
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
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleArchive} sx={{ color: 'warning.main' }}>
          <ArchiveIcon sx={{ mr: 1 }} fontSize="small" />
          Archive
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CustomersList;