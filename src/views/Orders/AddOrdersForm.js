
import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Button, TextField, MenuItem, Box, IconButton, Divider, InputAdornment, Select, FormControl, FormControlLabel, Checkbox, List, ListItem, ListItemText, ListSubheader, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Snackbar, Alert, Dialog, DialogTitle, DialogContent, Stack, Slide
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CategoryIcon from '@mui/icons-material/Category';
import StyleIcon from '@mui/icons-material/Style';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useNavigate } from 'react-router-dom'; // Add at top if not present

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
const navigate = useNavigate();
  //const [selectedCustomer, setSelectedCustomer] = useState('');
//  const [deliveryAddress, setDeliveryAddress] = useState('');
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
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const [deliveryAddress, setDeliveryAddress] = useState({
  streetAddress: '',
  city: '',
  stateProvince: '',
  postalCode: '',
  country: ''
});


const [useCustomerAddress, setUseCustomerAddress] = useState(true);

  useEffect(() => {
    // Fetch customers for dropdown
    setLoading(true); // start loading before fetch
  fetch('http://localhost:5000/api/customers')
    .then(res => res.json())
    .then(data => {
       console.log('API data:', data);
      if (Array.isArray(data)) {
        setCustomers(data);
      } else if (Array.isArray(data.data)) {
        setCustomers(data.data);
      } else {
        setCustomers([]);
      }
    })
    .catch(() => setCustomers([]))
    .finally(() => setLoading(false));
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

  const [qtySelection, setQtySelection] = useState({});
  const handleQtyChange = (id, delta) => {
    setQtySelection(prev => {
      const qty = (prev[id] || 0) + delta;
      return { ...prev, [id]: qty > 0 ? qty : 0 };
    });
  };

  const handleAddToCart = (id) => {
    setCart(prev => ({
      ...prev,
      [id]: qtySelection[id] || 1
    }));
    setSnackbarOpen(true);
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

  const [errors, setErrors] = useState({});

  const validateForm = () => {
  let newErrors = {};

  if (!selectedCustomer) newErrors.selectedCustomer = "Please select a customer.";
  if (!filters.paymentMethod) newErrors.paymentMethod = "Please select a payment method.";
  
  if (!useCustomerAddress) {
    if (!deliveryAddress.streetAddress) newErrors.streetAddress = "Street address is required.";
    if (!deliveryAddress.city) newErrors.city = "City is required.";
    if (!deliveryAddress.stateProvince) newErrors.stateProvince = "State/Province is required.";
    if (!deliveryAddress.postalCode) newErrors.postalCode = "Postal code is required.";
    if (!deliveryAddress.country) newErrors.country = "Country is required.";
  }

  if (!deliveryDate) newErrors.deliveryDate = "Please pick a delivery date.";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  useEffect(() => {
  if (selectedCustomer && useCustomerAddress) {
    const customer = customers.find(c => c.customerNumber.toString() === selectedCustomer);
    if (customer) {
      setDeliveryAddress({
        streetAddress: customer.streetAddress || '',
        city: customer.city || '',
        stateProvince: customer.stateProvince || '',
        postalCode: customer.postalCode || '',
        country: customer.country || ''
      });
    }
  }
}, [selectedCustomer, useCustomerAddress, customers]);


  const handleCloseAndRefresh = () => {
    // Optionally, show a success message if order was just created
    if (orderSuccess) {
      setOrderSuccess(false); // Hide after showing
      setTimeout(() => {
        window.location.reload(); // Refresh the page to show new orders
      }, 1000); // Show message for 1s before refresh
    } else {
      window.location.reload(); // Just refresh
    }
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
            <ListItemIcon>
              {cat === 'All Products' && <CategoryIcon sx={{ color: '#1976d2' }} />}
              {cat === 'Fashion Accessories' && <StyleIcon sx={{ color: '#d81b60' }} />}
              {cat === 'African print-inspired custom clothing' && <CheckroomIcon sx={{ color: '#43a047' }} />}
              {cat === 'Corporate Gifts' && <CardGiftcardIcon sx={{ color: '#fbc02d' }} />}
            </ListItemIcon>
            <ListItemText primary={cat} />
          </ListItem>
          ))}
        </List>
      </Paper>
      <Box sx={{ flex: 1, p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {/* Back Button at top left */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 16,
              color: 'primary.main',
              pl: 0,
              mr: 2
            }}
          >
            Back
          </Button>

          {/* Centered Title: Add New Order */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              flex: 1,
              textAlign: 'center'
            }}
          >
            Order Page
          </Typography>

          {/* Cart Icon at right */}
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
                        <Typography sx={{ mx: 1 }}>{qtySelection[product.product_id] || 0}</Typography>
                        <IconButton size="small" onClick={() => handleQtyChange(product.product_id, 1)}>
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      R{((qtySelection[product.product_id] || 0) * product.selling_price).toFixed(2)}
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
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', minHeight: 56 }}>
            <Button
              startIcon={<span style={{ fontSize: 20, fontWeight: 700 }}>{'<'}</span>}
              onClick={handleCartDialogClose}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: 16, color: 'primary.main', pl: 0 }}
            >
              Back
            </Button>
            <Typography variant="h6" sx={{ flex: 1, textAlign: 'center', fontWeight: 700 }}>
              Cart
            </Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ bgcolor: '#fafafa' }}>
            <Box sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Your Cart</Typography>
              {Object.keys(cart).length === 0 || Object.values(cart).every(qty => qty === 0) ? (
                <Typography>No items in cart.</Typography>
              ) : (
                <Stack spacing={3}>
  {products.filter(p => cart[p.product_id] > 0).map(product => {
  const availableStock = product.quantity; // from DB
  const currentQty = cart[product.product_id];

  // If stock dropped below current cart qty, auto-adjust
  const maxQty = Math.min(availableStock, currentQty);

  return (
    <Box
      key={product.product_id}
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#fff',
        borderRadius: 3,
        boxShadow: 1,
        p: 2,
      }}
    >
      {/* Product Image */}
      <Box
        component="img"
        src={
          product.image_path && product.image_path.startsWith('/images/products/')
            ? `http://localhost:5000${product.image_path}`
            : 'http://localhost:5000/images/products/placeholder.png'
        }
        alt={product.product_name}
        sx={{
          width: 80,
          height: 80,
          objectFit: 'cover',
          borderRadius: 2,
          mr: 3,
          border: '1px solid #eee',
          bgcolor: '#f5f5f5',
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'http://localhost:5000/images/products/placeholder.png';
        }}
      />

      {/* Product Details */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {product.product_name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {product.category}
        </Typography>

        {/* Quantity Selector */}
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={currentQty}
            onChange={(e) => {
              const newQty = e.target.value;
              // If stock is enough, update; else force adjust
              if (newQty <= availableStock) {
                setCart((prev) => ({ ...prev, [product.product_id]: newQty }));
              }
            }}
          >
            {Array.from({ length: availableStock }, (_, i) => i + 1).map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Stock Status */}
        <Typography
          variant="body2"
          sx={{ mt: 1, color: availableStock > 0 ? 'green' : 'red' }}
        >
          {availableStock > 0 ? `${availableStock} in stock` : 'Out of Stock'}
        </Typography>
      </Box>

      {/* Price */}
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, minWidth: 80, textAlign: 'right', mr: 2 }}
      >
        R{(currentQty * product.selling_price).toFixed(2)}
      </Typography>

      {/* Remove Button */}
      <Button
        color="error"
        variant="outlined"
        size="small"
        onClick={() =>
          setCart((prev) => {
            const newCart = { ...prev };
            delete newCart[product.product_id];
            return newCart;
          })
        }
      >
        Remove
      </Button>
    </Box>
  );
})}


  {/* ✅ Cart Totals */}
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: 700 }}>
      Total: ({Object.values(cart).reduce((a, b) => a + b, 0)} Items)
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
      R{products.reduce((sum, p) => sum + (cart[p.product_id] || 0) * p.selling_price, 0).toFixed(2)}
    </Typography>
  </Box>

  {/* ✅ Checkout button with stock check */}
  {(() => {
    const hasOutOfStockItems = products.some(
      p => cart[p.product_id] > 0 && cart[p.product_id] > p.quantity
    );

    return (
      <>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 2, borderRadius: 2, fontWeight: 700 }}
          onClick={() => setCheckoutDialogOpen(true)}
          disabled={hasOutOfStockItems}
        >
          Proceed to Checkout
        </Button>
        {hasOutOfStockItems && (
          <Typography color="error" sx={{ mt: 1, fontWeight: 600 }}>
            Please adjust your cart — some items are out of stock.
          </Typography>
        )}
      </>
    );
  })()}


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
               error={!!errors.selectedCustomer}
              helperText={errors.selectedCustomer}
            >
              {loading ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : customers.length > 0 ? (
                customers.map(cust => (
                  <MenuItem key={cust.customerNumber} value={cust.customerNumber.toString()}>
                    {`${cust.firstName} ${cust.lastName}, ${cust.email}`}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No customers found</MenuItem>
              )}
            </TextField>


                  
                <TextField
                  select
                  label="Payment Method"
                  value={filters.paymentMethod || ''}
                  onChange={e => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  fullWidth
                  required
                  error={!!errors.paymentMethod}
                  helperText={errors.paymentMethod}
                >
                  <MenuItem value="Cash">
                    <AttachMoneyIcon sx={{ mr: 1 }} /> Cash On Delivery
                  </MenuItem>
                  <MenuItem value="Card">
                    <CreditCardIcon sx={{ mr: 1 }} /> Credit and Debit Card
                  </MenuItem>
                  <MenuItem value="EFT">
                  <AccountBalanceIcon sx={{ mr: 1 }} /> EFT
                </MenuItem>
                <MenuItem value="Mobile Money">
                  <PhoneAndroidIcon sx={{ mr: 1 }} /> Mobile Money
                </MenuItem>
                </TextField>
                
                <FormControlLabel
                control={
                  <Checkbox
                    checked={useCustomerAddress}
                    onChange={e => setUseCustomerAddress(e.target.checked)}
                  />
                }
                label="Use customer's saved address"
                sx={{ mb: 2 }}
              />

               <TextField
                label="Street Address"
                value={deliveryAddress.streetAddress}
                onChange={e => setDeliveryAddress(prev => ({ ...prev, streetAddress: e.target.value }))}
                fullWidth
                required
                disabled={useCustomerAddress}
              />

              <TextField
                label="City"
                value={deliveryAddress.city}
                onChange={e => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                fullWidth
                required
                disabled={useCustomerAddress}
              />

              <TextField
                label="State / Province"
                value={deliveryAddress.stateProvince}
                onChange={e => setDeliveryAddress(prev => ({ ...prev, stateProvince: e.target.value }))}
                fullWidth
                required
                disabled={useCustomerAddress}
              />

              <TextField
                label="Postal Code"
                value={deliveryAddress.postalCode}
                onChange={e => setDeliveryAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                fullWidth
                required
                disabled={useCustomerAddress}
              />

              <TextField
                label="Country"
                value={deliveryAddress.country}
                onChange={e => setDeliveryAddress(prev => ({ ...prev, country: e.target.value }))}
                fullWidth
                required
                disabled={useCustomerAddress}
              />



                <TextField
                  label="Delivery Date"
                  type="date"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  error={!!errors.deliveryDate}
                  helperText={errors.deliveryDate}
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
  if (!validateForm()) return; // stop if validation fails

  setOrderSubmitting(true);
  setOrderError('');
  setOrderSuccess(false);

  const orderItems = products.filter(p => cart[p.product_id] > 0).map(product => ({
    product_id: product.product_id,
    quantity: cart[product.product_id],
    unit_price: product.selling_price
  }));

  const payload = {
    cust_id: selectedCustomer,
    payment_method: filters.paymentMethod,
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
      // clear form
      setSelectedCustomer('');
      setFilters({ paymentMethod: '' });
      setUseCustomerAddress(false);
      setDeliveryAddress({ streetAddress: '', city: '', stateProvince: '', postalCode: '', country: '' });
      setDeliveryDate('');
      setOrderComment('');
      setCart({});
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
