
import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Button, TextField, MenuItem, Box, IconButton, Divider, InputAdornment, List, ListItem, ListItemText, ListSubheader, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Snackbar, Alert, Dialog, DialogTitle, DialogContent, Stack, Slide
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const categories = ['All Products', 'Fashion Accessories', 'African print-inspired custom clothing', 'Corporate Gifts'];
const sortOptions = [
  { label: 'Best Selling', value: 'best' },
  { label: 'Alphabetically, A-Z', value: 'az' },
  { label: 'Alphabetically, Z-A', value: 'za' },
];

// Products will be fetched from backend


const AddOrdersForm = () => {
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderComment, setOrderComment] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    sort: '',
    search: '',
  });
  const [cart, setCart] = useState({});
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch customers for dropdown
    fetch('http://localhost:5000/api/customers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers(data);
        } else if (Array.isArray(data.data)) {
          setCustomers(data.data);
        } else {
          setCustomers([]);
        }
      })
      .catch(() => setCustomers([]));
    setLoading(true);
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
        setError('Failed to fetch products');
      });
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCategory = !filters.category || filters.category === 'All Products' || p.category === filters.category;
    const matchSearch = !filters.search || p.product_name.toLowerCase().includes(filters.search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleSidebarChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleQtyChange = (id, delta) => {
    setCart(prev => {
      const qty = (prev[id] || 0) + delta;
      return { ...prev, [id]: qty > 0 ? qty : 0 };
    });
  };

  const handleAddToCart = (id) => {
    setSnackbarOpen(true);
    // Add product to cart (already handled by handleQtyChange)
  };

  const handleGoToCart = () => {
    setSnackbarOpen(false);
    setCartDialogOpen(true);
  };

  const handleCartIconClick = () => {
    setCartDialogOpen(true);
  };

  const handleCartDialogClose = () => {
    setCartDialogOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#fafafa' }}>
      <Paper elevation={2} sx={{ width: 240, p: 2, borderRadius: 0, bgcolor: '#fff', minHeight: '100vh' }}>
        <List subheader={<ListSubheader>Filters</ListSubheader>}>
          <ListItem>
            <TextField
              select
              label="Sort By"
              value={filters.sort}
              onChange={e => handleSidebarChange('sort', e.target.value)}
              fullWidth
              size="small"
            >
              {sortOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </ListItem>
          <Divider sx={{ my: 1 }} />
          <ListSubheader sx={{ pl: 0 }}>Categories</ListSubheader>
          {categories.map(cat => (
            <ListItem button key={cat} selected={filters.category === cat} onClick={() => handleSidebarChange('category', cat)}>
              <ListItemText primary={cat} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box sx={{ flex: 1, p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>Order Form</Typography>
          <IconButton
            color="primary"
            sx={{ ml: 2, bgcolor: '#e3f2fd', borderRadius: 2, p: 1, boxShadow: 1 }}
            onClick={handleCartIconClick}
          >
            <ShoppingCartIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            label="Search products..."
            value={filters.search}
            onChange={e => handleSidebarChange('search', e.target.value)}
            size="small"
            sx={{ width: 350 }}
          />
        </Box>
        {loading ? (
          <Typography>Loading products...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell>Cart</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map(product => (
                  <TableRow key={product.product_id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={(() => {
                            if (product.image_path && product.image_path.startsWith('/images/products/')) {
                              return `http://localhost:5000${product.image_path}`;
                            }
                            return 'http://localhost:5000/images/products/placeholder.png';
                          })()}
                          alt={product.product_name}
                          sx={{
                            width: 48,
                            height: 48,
                            objectFit: 'cover',
                            borderRadius: 2,
                            boxShadow: 1,
                            mr: 2,
                            bgcolor: '#f5f5f5',
                            border: '1px solid #eee',
                            display: 'inline-block'
                          }}
                          onError={e => { e.target.onerror = null; e.target.src = 'http://localhost:5000/images/products/placeholder.png'; }}
                        />
                        <Typography sx={{ fontWeight: 500 }}>{product.product_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size="small" onClick={() => handleQtyChange(product.product_id, -1)}>
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 1 }}>{cart[product.product_id] || 0}</Typography>
                        <IconButton size="small" onClick={() => handleQtyChange(product.product_id, 1)}>
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      R{((cart[product.product_id] || 0) * product.selling_price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddToCart(product.product_id)}
                      >
                        Add to cart
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {/* Snackbar for Add to Cart */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity="success"
            sx={{ width: '100%' }}
            action={
              <Button color="inherit" size="small" onClick={handleGoToCart}>
                Go to Cart
              </Button>
            }
          >
            Product added to cart
          </Alert>
        </Snackbar>
        {/* Cart Dialog */}
        <Dialog
          open={cartDialogOpen}
          onClose={handleCartDialogClose}
          fullScreen
          TransitionComponent={Slide}
          TransitionProps={{ direction: 'up' }}
        >
          <DialogTitle>
            Cart
            <IconButton
              aria-label="close"
              onClick={handleCartDialogClose}
              sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ bgcolor: '#fafafa' }}>
            <Box sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Your Cart</Typography>
              {Object.keys(cart).length === 0 || Object.values(cart).every(qty => qty === 0) ? (
                <Typography>No items in cart.</Typography>
              ) : (
                <Stack spacing={3}>
                  {products.filter(p => cart[p.product_id] > 0).map(product => (
                    <Box key={product.product_id} sx={{ display: 'flex', alignItems: 'center', bgcolor: '#fff', borderRadius: 3, boxShadow: 1, p: 2 }}>
                      <Box
                        component="img"
                        src={(() => {
                          if (product.image_path && product.image_path.startsWith('/images/products/')) {
                            return `http://localhost:5000${product.image_path}`;
                          }
                          return 'http://localhost:5000/images/products/placeholder.png';
                        })()}
                        alt={product.product_name}
                        sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 2, mr: 3, border: '1px solid #eee', bgcolor: '#f5f5f5' }}
                        onError={e => { e.target.onerror = null; e.target.src = 'http://localhost:5000/images/products/placeholder.png'; }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{product.product_name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{product.category}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Qty: {cart[product.product_id]}</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 80, textAlign: 'right' }}>
                        R{(cart[product.product_id] * product.selling_price).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Total: ({Object.values(cart).reduce((a, b) => a + b, 0)} Items)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      R{products.reduce((sum, p) => sum + (cart[p.product_id] || 0) * p.selling_price, 0).toFixed(2)}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ mt: 2, borderRadius: 2, fontWeight: 700 }}
                    onClick={() => setCheckoutDialogOpen(true)}
                  >
                    Proceed to Checkout
                  </Button>
        {/* Checkout Dialog */}
        <Dialog
          open={checkoutDialogOpen}
          onClose={() => setCheckoutDialogOpen(false)}
          fullScreen
          TransitionComponent={Slide}
          TransitionProps={{ direction: 'up' }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', minHeight: 56 }}>
            <Button
              startIcon={<span style={{ fontSize: 20, fontWeight: 700 }}>{'<'}</span>}
              onClick={() => setCheckoutDialogOpen(false)}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: 16, color: 'primary.main', pl: 0 }}
            >
              Back
            </Button>
            <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', fontWeight: 700 }}>
              Order Details
            </Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ bgcolor: '#fafafa' }}>
            <Box sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Order Details</Typography>
              <Stack spacing={3}>
                <TextField
                  select
                  label="Select Customer"
                  value={selectedCustomer}
                  onChange={e => setSelectedCustomer(e.target.value)}
                  fullWidth
                  required
                >
                  {customers.map(cust => (
                    <MenuItem key={cust.customer_id} value={cust.customer_id}>
                      {cust.customer_name || cust.name || cust.email}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Delivery Address"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Delivery Date"
                  type="date"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
                <TextField
                  label="Comment (optional)"
                  value={orderComment}
                  onChange={e => setOrderComment(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <Divider />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Order Summary</Typography>
                <Stack spacing={2}>
                  {products.filter(p => cart[p.product_id] > 0).map(product => (
                    <Box key={product.product_id} sx={{ display: 'flex', alignItems: 'center', bgcolor: '#fff', borderRadius: 3, boxShadow: 1, p: 2 }}>
                      <Box
                        component="img"
                        src={(() => {
                          if (product.image_path && product.image_path.startsWith('/images/products/')) {
                            return `http://localhost:5000${product.image_path}`;
                          }
                          return 'http://localhost:5000/images/products/placeholder.png';
                        })()}
                        alt={product.product_name}
                        sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 2, mr: 3, border: '1px solid #eee', bgcolor: '#f5f5f5' }}
                        onError={e => { e.target.onerror = null; e.target.src = 'http://localhost:5000/images/products/placeholder.png'; }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{product.product_name}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{product.category}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Qty: {cart[product.product_id]}</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 80, textAlign: 'right' }}>
                        R{(cart[product.product_id] * product.selling_price).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Total: ({Object.values(cart).reduce((a, b) => a + b, 0)} Items)</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    R{products.reduce((sum, p) => sum + (cart[p.product_id] || 0) * p.selling_price, 0).toFixed(2)}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ mt: 2, borderRadius: 2, fontWeight: 700 }}
                  disabled={orderSubmitting}
                  onClick={async () => {
                    setOrderSubmitting(true);
                    setOrderError('');
                    setOrderSuccess(false);
                    // Prepare order payload
                    const orderItems = products.filter(p => cart[p.product_id] > 0).map(product => ({
                      product_id: product.product_id,
                      quantity: cart[product.product_id],
                      unit_price: product.selling_price
                    }));
                    const payload = {
                      customer_id: selectedCustomer,
                      delivery_address: deliveryAddress,
                      delivery_date: deliveryDate,
                      comment: orderComment,
                      items: orderItems
                    };
                    try {
                      const res = await fetch('http://localhost:5000/api/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        setOrderSuccess(true);
                        // Optionally clear cart
                        setCart({});
                        // Optionally deduct inventory in frontend (will be handled by backend)
                      } else {
                        setOrderError(data.message || 'Failed to submit order');
                      }
                    } catch (err) {
                      setOrderError('Network error');
                    }
                    setOrderSubmitting(false);
                  }}
                >
                  Submit Order
                </Button>
                {orderSuccess && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Order submitted successfully!
                  </Alert>
                )}
                {orderError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {orderError}
                  </Alert>
                )}
              </Stack>
            </Box>
          </DialogContent>
        </Dialog>
                </Stack>
              )}
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AddOrdersForm;
