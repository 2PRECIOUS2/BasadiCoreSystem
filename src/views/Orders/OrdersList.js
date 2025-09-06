import React, { useState, useEffect } from 'react';
import {
  Paper, Grid, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Box, Divider, InputAdornment,
  Menu, MenuItem, Avatar, TextField
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import UpdateOrderModal from './UpdateOrderModal';
import ViewOrderInvoice from './ViewOrderInvoice';
import CancelOrder from './CancelOrder';

const statusColors = {
  Pending: 'warning',
  Delivered: 'success',
  Cancelled: 'error',
};
const statusOptions = ['Pending', 'Delivered', 'Cancelled'];

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ orderNo: '', customer: '', status: '', delivery: '', date: '' });
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedInvoiceOrderNo, setSelectedInvoiceOrderNo] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const open = Boolean(anchorEl);

  const avatarColors = [
  '#F44336', // red
  '#E91E63', // pink
  '#9C27B0', // purple
  '#3F51B5', // indigo
  '#009688', // teal
  '#4CAF50', // green
  '#FF9800', // orange
  '#795548', // brown
  '#607D8B', // blue-grey
  '#2196F3', // blue
];
  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders');
      const formattedOrders = res.data.map(order => ({
        ...order,
        customer: order.customer || 'Unknown',
        totalamount: Number(order.totalamount) || 0,
        status: (order.status || 'Pending').charAt(0).toUpperCase() + (order.status || 'Pending').slice(1),
      }));
      setOrders(formattedOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Menu handlers
  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setMenuRow(row);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  // Update modal
  const handleOpenUpdateModal = (order) => {
    setSelectedOrder(order);
    setOpenUpdate(true);
    handleMenuClose();
  };
  const handleCloseUpdateModal = () => {
    setOpenUpdate(false);
    setSelectedOrder(null);
  };
  const handleOrderUpdated = (updatedOrder) => {
    setOrders(prev =>
      prev.map(o => (o.orderno === updatedOrder.orderno ? updatedOrder : o))
    );
  };

  // Invoice view
  const handleViewInvoice = (order) => {
    setSelectedInvoiceOrderNo(order.orderno);
    setInvoiceOpen(true);
    handleMenuClose();
  };

  // Cancel Order
  const handleCancelClick = (order) => {
       if (!order) return;
  if (order.status.toLowerCase() !== "pending") {
    alert("Only pending orders can be cancelled");
    return;
  }
  console.log("Cancel clicked:", order);
  setSelectedOrder(order);
  setCancelDialogOpen(true);
  };
  const handleCancelled = () => {
    setCancelDialogOpen(false);
    fetchOrders();
  };

  // Filtering + Search
  const filteredOrders = orders.filter(order => {
    return (
      (!filters.orderNo || order.orderno.toString().includes(filters.orderNo)) &&
      (!filters.customer || order.customer.toLowerCase().includes(filters.customer.toLowerCase())) &&
      (!filters.status || order.status === filters.status) &&
      (!filters.delivery || (order.deliveryAddress && Object.values(order.deliveryAddress).join(' ').toLowerCase().includes(filters.delivery.toLowerCase()))) &&
      (!filters.date || order.deliverydate?.startsWith(filters.date)) &&
      (!searchText || order.customer.toLowerCase().includes(searchText.toLowerCase()))
    );
  });

  return (
    <Paper elevation={4} sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc', maxWidth: 1200, mx: 'auto', mt: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Orders</Typography>

      {/* Filters */}
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
              {statusOptions.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
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
                startAdornment: <InputAdornment position="start"><FilterListIcon /></InputAdornment>,
                endAdornment: <InputAdornment position="end"><SearchIcon sx={{ mr: 1 }} /></InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Orders Table */}
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
            {filteredOrders.length > 0 ? filteredOrders.map(order => (
              <TableRow
                key={order.orderno}
                sx={{ bgcolor: order.status.toLowerCase() === 'cancelled' ? '#f5f5f5' : 'inherit' }}
              >
                <TableCell>{order.orderno}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                    sx={{
                      bgcolor: avatarColors[orders.indexOf(order) % avatarColors.length],
                      mr: 1
                    }}
                  >
                    {order.customer ? order.customer.split(' ').map(n => n[0]).join('') : '?'}
                  </Avatar>
                                      <Typography>{order.customer}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{order.deliverydate ? new Date(order.deliverydate).toLocaleDateString() : ''}</TableCell>
                <TableCell>{order.deliveryAddress || order.deliveryaddress?.streetAddress || ''}</TableCell>
                <TableCell>R{order.totalamount.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip label={order.status} color={statusColors[order.status] || 'default'} variant="outlined" sx={{ fontWeight: 700 }} />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={e => handleMenuOpen(e, order)}
                    disabled={order.status.toLowerCase() === 'cancelled'}
                    sx={{ color: order.status.toLowerCase() === 'cancelled' ? 'grey.400' : 'inherit' }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} align="center">No orders found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleViewInvoice(menuRow)}>
          <ReceiptLongIcon sx={{ mr: 1, color: '#1976d2' }} />
          View Invoice
        </MenuItem>
        <MenuItem onClick={() => handleOpenUpdateModal(menuRow)}>
          <EditIcon sx={{ mr: 1, color: '#1976d2' }} />
          Update
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCancelClick(menuRow);
            handleMenuClose();
          }}
        >
          <CancelIcon sx={{ mr: 1, color: '#d32f2f' }} />
          Cancel Order
        </MenuItem>
      </Menu>

      {/* Update Modal */}
      {selectedOrder && (
        <UpdateOrderModal
          open={openUpdate}
          order={selectedOrder}
          onClose={handleCloseUpdateModal}
          onUpdate={handleOrderUpdated}
        />
      )}

      {/* Invoice Modal */}
      <ViewOrderInvoice
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        orderno={selectedInvoiceOrderNo}
      />

      {/* Cancel Order Dialog */}
      <CancelOrder
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        orderno={selectedOrder?.orderno}
        onCancelled={handleCancelled}
      />

    </Paper>
  );
};

export default OrdersList;
