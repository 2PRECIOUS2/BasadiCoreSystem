// src/views/Products/ProductList.js
import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar, // Keeping Avatar for consistency, assuming products might have images
  IconButton,
  Menu,
  MenuItem,
  Box,
  TextField,
  InputAdornment,
  Select
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // For ellipses
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Green arrow
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; // Red arrow
import SearchIcon from '@mui/icons-material/Search';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Search/filter state
  const [searchFilter, setSearchFilter] = useState('product_name');
  const [searchValue, setSearchValue] = useState('');

  // Placeholder for fetching products (you'll need a backend endpoint for this)
  const fetchProducts = () => {

    fetch('http://localhost:5000/api/products/all') // Assuming this endpoint will exist
      .then(res => {
        console.log('Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Fetched products:', data);
        setProducts(data);
      })
      .catch(error => console.error('Error fetching products:', error));
  
  };

  useEffect(() => {
    fetchProducts();
  }, []);

    const filteredProducts = products.filter(prod => {
    const value = searchValue.toLowerCase();
    if (!value) return true;
    if (searchFilter === 'product_name') return prod.product_name.toLowerCase().includes(value);
    if (searchFilter === 'category') return (prod.category || '').toLowerCase().includes(value);
    return true;
  });

  const handleMenuClick = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleUpdate = () => {
    if (selectedProduct) {
      alert(`Implement update for product: ${selectedProduct.product_name}`);
      // This would open a modal with an update form.
    }
    handleMenuClose();
  };
    const handleSearch = (e) => {
    e.preventDefault();
    // Filtering is handled reactively above
  };
 

  return (
    <>

    {/* Search Bar with Filter */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Select
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="product_name">Product Name</MenuItem>
          <MenuItem value="category">Category</MenuItem>
        </Select>
        <form onSubmit={handleSearch} style={{ flex: 1 }}>
          <TextField
            size="small"
            placeholder={`Search by ${searchFilter.replace('_', ' ')}`}
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" size="small">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </form>
      </Box>

      <Grid container spacing={3}>
        {filteredProducts.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body1">No products found.</Typography>
          </Grid>
        ) : (
          filteredProducts.map((prod) => (
            <Grid item xs={12} sm={6} md={4} key={prod.id}> {/* Adjusted grid size for products */}
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      {/* Assuming product images are in public/images/products */}
                     <Avatar
                      variant="square"
                      src={`/images/products/${prod.image_path}`}
                      sx={{ width: 56, height: 56 }}
                      imgProps={{ onError: (e) => { e.target.src = '/images/products/placeholder.png'; } }}
                    />
                </Grid>
                    <Grid item xs>
                      <Typography variant="h6">{prod.product_name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body1" sx={{ mr: 1 }}>
                          Quantity: {prod.quantity}
                        </Typography>
                        {prod.quantity > 20 ? (
                          <ArrowUpwardIcon sx={{ color: 'green' }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ color: 'red' }} />
                        )}
                      </Box>
                    </Grid>
                    <Grid item>
                      <IconButton
                        aria-label="settings"
                        onClick={(event) => handleMenuClick(event, prod)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && selectedProduct?.id === prod.id}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={handleUpdate}>Update</MenuItem>
                      </Menu>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </>
  );
};

export default ProductList;