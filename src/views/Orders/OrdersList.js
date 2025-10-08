import React, { useState, useEffect } from 'react';
import {
  Paper, Grid, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Box, Divider, InputAdornment,
  Menu, MenuItem, Avatar, TextField, Card, CardContent, Button, Fade
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';
import UpdateOrderModal from './UpdateOrderModal';
import ViewOrderInvoice from './ViewOrderInvoice';
import CancelOrder from './CancelOrder';
import { API_BASE_URL } from 'src/config';


const statusColors = {
  Pending: { bg: '#fef3c7', color: '#92400e' },
  Delivered: { bg: '#d1fae5', color: '#065f46' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b' },
  Processing: { bg: '#dbeafe', color: '#1e40af' }
};
const statusOptions = ['Pending', 'Delivered', 'Cancelled'];

const OrdersList = ({ filterSize = 6, searchSize = 12, onAddOrder }) => {
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
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // purple
  ];
  // Fetch orders

const fetchOrders = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/orders`, { withCredentials: true });

    // Adjust if your API wraps data in a `data` property
    const ordersData = res.data.data || res.data || [];

    const formattedOrders = ordersData.map(order => ({
      ...order,
      customer: order.customer || 'Unknown',
      totalamount: Number(order.totalamount) || 0,
      status: (order.status || 'Pending').charAt(0).toUpperCase() + (order.status || 'Pending').slice(1),
    }));

    setOrders(formattedOrders);
  } catch (err) {
    console.error('Failed to fetch orders:', err.response?.data || err.message);
    setOrders([]);
  }
};


  useEffect(() => {
    fetchOrders();
  }, []);

  // Add this useEffect to refresh when the component becomes visible
  useEffect(() => {
    const handleFocus = () => {
      fetchOrders();
    };
    
    // Refresh on window focus (when user comes back to the tab)
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
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
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 4
    }}>
      {/* Modern Header Section */}
      <Box sx={{ 
        background: 'white',
        borderRadius: 3,
        p: 4,
        mb: 4,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 3
            }}>
              <ShoppingCartIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#1e293b',
                mb: 1
              }}>
                Order Management
              </Typography>
              <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                Track and manage customer orders efficiently
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Access Level: super_admin • Orders Module
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddOrder}
            sx={{
              background: '#667eea',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              '&:hover': {
                background: '#5a67d8'
              }
            }}
          >
            Add New Order
          </Button>
        </Box>
      </Box>

      {/* Search & Filter Section */}
      <Card sx={{ 
        borderRadius: 3, 
        mb: 4,
        background: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <TextField 
                label="Order No" 
                name="orderNo" 
                value={filters.orderNo} 
                onChange={handleFilterChange} 
                fullWidth 
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField 
                label="Customer" 
                name="customer" 
                value={filters.customer} 
                onChange={handleFilterChange} 
                fullWidth 
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField 
                select 
                label="Status" 
                name="status" 
                value={filters.status} 
                onChange={handleFilterChange} 
                fullWidth 
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                {statusOptions.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField 
                label="Delivery" 
                name="delivery" 
                value={filters.delivery} 
                onChange={handleFilterChange} 
                fullWidth 
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField 
                label="Date" 
                name="date" 
                type="date" 
                value={filters.date} 
                onChange={handleFilterChange} 
                fullWidth 
                size="small" 
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                placeholder="Search..."
                value={searchText}
                onChange={handleSearchChange}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card sx={{ 
        borderRadius: 3,
        background: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  background: '#667eea',
                  color: 'white',
                  fontWeight: 600,
                  py: 2
                }}>
                  Order No
                </TableCell>
                <TableCell sx={{ 
                  background: '#667eea',
                  color: 'white',
                  fontWeight: 600,
                  py: 2
                }}>
                  Customer
                </TableCell>
                <TableCell sx={{ 
                  background: '#667eea',
                  color: 'white',
                  fontWeight: 600,
                  py: 2
                }}>
                  Delivery Date
                </TableCell>
                <TableCell sx={{ 
                  background: '#667eea',
                  color: 'white',
                  fontWeight: 600,
                  py: 2
                }}>
                  Delivery Address
                </TableCell>
                <TableCell sx={{ 
                  background: '#667eea',
                  color: 'white',
                  fontWeight: 600,
                  py: 2
                }}>
                  Total Amount
                </TableCell>
                <TableCell sx={{ 
                  background: '#667eea',
                  color: 'white',
                  fontWeight: 600,
                  py: 2
                }}>
                  Status
                </TableCell>
                <TableCell sx={{ 
                  background: '#667eea',
                  color: 'white',
                  fontWeight: 600,
                  py: 2
                }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length > 0 ? filteredOrders.map((order, index) => (
                <Fade in={true} timeout={300 + (index * 50)} key={order.orderno}>
                  <TableRow
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: '#f8fafc'
                      },
                      '&:nth-of-type(even)': {
                        backgroundColor: 'white'
                      },
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      },
                      transition: 'all 0.2s ease',
                      opacity: order.status.toLowerCase() === 'cancelled' ? 0.6 : 1,
                      borderLeft: `3px solid ${statusColors[order.status]?.color || '#6b7280'}`,
                      '& td': {
                        borderBottom: '1px solid #e2e8f0',
                        py: 2
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{
                        background: '#667eea',
                        color: 'white',
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        display: 'inline-block'
                      }}>
                        #{order.orderno}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: avatarColors[orders.indexOf(order) % avatarColors.length],
                            width: 36,
                            height: 36,
                            fontWeight: 600,
                            fontSize: '0.8rem'
                          }}
                        >
                          {order.customer ? order.customer.split(' ').map(n => n[0]).join('') : '?'}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 500, mb: 0.5, fontSize: '0.9rem' }}>
                            {order.customer}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Customer
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 500 }}>
                          {order.deliverydate ? new Date(order.deliverydate).toLocaleDateString('en-CA') : 'Not set'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        sx={{ 
                          fontWeight: 500,
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={order.deliveryAddress || 'No address provided'}
                      >
                        {order.deliveryAddress || 'No address provided'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{
                        background: '#10b981',
                        color: 'white',
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        display: 'inline-block'
                      }}>
                        R{order.totalamount.toFixed(2)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status}
                        sx={{
                          backgroundColor: statusColors[order.status]?.bg || '#f3f4f6',
                          color: statusColors[order.status]?.color || '#6b7280',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          py: 1,
                          px: 2,
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={e => handleMenuOpen(e, order)}
                        disabled={order.status.toLowerCase() === 'cancelled'}
                        sx={{ 
                          color: '#667eea',
                          border: '2px solid transparent',
                          '&:hover': {
                            bgcolor: '#667eea',
                            color: 'white',
                            transform: 'scale(1.1)',
                            border: '2px solid #667eea'
                          },
                          '&:disabled': {
                            opacity: 0.3,
                            transform: 'none'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </Fade>
              )) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ 
                      textAlign: 'center',
                      py: 8,
                      color: '#64748b'
                    }}>
                      <ShoppingCartIcon sx={{ fontSize: 80, mb: 3, opacity: 0.3 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                        No Orders Found
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.7, mb: 3 }}>
                        Try adjusting your search filters
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onAddOrder}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 600,
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Create New Order
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

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

    </Box>
  );
};

export default OrdersList;
