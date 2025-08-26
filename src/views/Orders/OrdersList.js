import React, { useState } from 'react';
import {
  Paper, Grid, Typography, Button, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Box, Divider, InputAdornment, Menu
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';

const statusColors = {
  Pending: 'warning',
  Delivered: 'success',
  Cancelled: 'error',
};

// Dummy data for demonstration
const ordersData = [
  {
    orderNo: '10001',
    customer: 'Jane Cooper',
    deliveryDate: '2025-08-25',
    deliveryAddress: '4140 Parker Rd, Allen',
    total: 1200.00,
    status: 'Pending',
  },
  {
    orderNo: '10002',
    customer: 'Darnell Steward',
    deliveryDate: '2025-08-26',
    deliveryAddress: '2188 Thornridge Cir, NY',
    total: 800.00,
    status: 'Delivered',
  },
  {
    orderNo: '10003',
    customer: 'Dianne Russell',
    deliveryDate: '2025-08-27',
    deliveryAddress: '2464 Royal Ln, Mesa',
    total: 950.00,
    status: 'Cancelled',
  },
];

const statusOptions = ['Pending', 'Delivered', 'Cancelled'];

const OrdersList = (props) => {
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const open = Boolean(anchorEl);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };
  // Filter states
  const [filters, setFilters] = useState({
    orderNo: '',
    customer: '',
    status: '',
    delivery: '',
    date: '',
  });

  // Filtered orders
  const filteredOrders = ordersData.filter(order => {
    return (
      (!filters.orderNo || order.orderNo.includes(filters.orderNo)) &&
      (!filters.customer || order.customer.toLowerCase().includes(filters.customer.toLowerCase())) &&
      (!filters.status || order.status === filters.status) &&
      (!filters.delivery || order.deliveryAddress.toLowerCase().includes(filters.delivery.toLowerCase())) &&
      (!filters.date || order.deliveryDate === filters.date)
    );
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Squeeze all filters and search into one row
  // 6 filters: Order No, Customer, Status, Delivery, Date, Search
  // Use xs={2} for each to fit 12 columns in one row
  const filterSize = 2;
  const searchSize = 2;

  return (
    <Paper elevation={4} sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc', maxWidth: 1200, mx: 'auto', mt: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Orders</Typography>
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={2}>
            <TextField label="Order No" name="orderNo" value={filters.orderNo} onChange={handleFilterChange} fullWidth size="small" />
          </Grid>
          <Grid item xs={2}>
            <TextField label="Customer" name="customer" value={filters.customer} onChange={handleFilterChange} fullWidth size="small" />
          </Grid>
          <Grid item xs={2}>
            <TextField select label="Status" name="status" value={filters.status} onChange={handleFilterChange} fullWidth size="small">
              <MenuItem value="">All</MenuItem>
              {statusOptions.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={2}>
            <TextField label="Delivery" name="delivery" value={filters.delivery} onChange={handleFilterChange} fullWidth size="small" />
          </Grid>
          <Grid item xs={2}>
            <TextField label="Date" name="date" type="date" value={filters.date} onChange={handleFilterChange} fullWidth size="small" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={2}>
            <TextField
              placeholder="Search..."
              value={searchText}
              onChange={handleSearchChange}
              fullWidth
              size="medium"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon sx={{ mr: 1 }} />
                    <Button variant="contained" color="primary" size="small">Search</Button>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 0 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f0f4fa' }}>
              <TableCell sx={{ fontWeight: 700 }}>Order No</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Delivery Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Delivery Address</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length > 0 ? filteredOrders.map((order, idx) => (
              <TableRow key={order.orderNo}>
                <TableCell>{order.orderNo}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.deliveryDate}</TableCell>
                <TableCell>{order.deliveryAddress}</TableCell>
                <TableCell>R{order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip label={order.status} color={statusColors[order.status]} variant="outlined" sx={{ fontWeight: 700 }} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuOpen(e, order)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} align="center">No orders found.</TableCell>
              </TableRow>
            )}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleMenuClose}>More Info</MenuItem>
              <MenuItem onClick={handleMenuClose}>Update</MenuItem>
              <MenuItem onClick={handleMenuClose}>Archive</MenuItem>
            </Menu>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default OrdersList;
