import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Box,
  TextField,
  InputAdornment,
  Select
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';
import ProductUpdateModal from './ProductUpdateModal';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Search/filter state
  const [searchFilter, setSearchFilter] = useState('product_name');
  const [searchValue, setSearchValue] = useState('');
   const [updateModalOpen, setUpdateModalOpen] = useState(false);

  // Fetch products from backend
  const fetchProducts = () => {
    fetch('http://localhost:5000/api/products/all')
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

   const handleSearch = (e) => {
    e.preventDefault();
    // The filtering is already done in filteredProducts, so just prevent form submission
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUpdate = () => {
    setUpdateModalOpen(true);
    handleMenuClose()
  };

  const handleUpdateComplete = () => {
  fetchProducts();           // Refresh the products list
  setUpdateModalOpen(false); // Close the modal
  setSelectedProduct(null);  // Clear selected product
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
          filteredProducts.map((prod) => {
            console.log('Product:', prod.product_name);
            console.log('Image path from DB:', prod.image_path);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={prod.id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        <Avatar
                          variant="square"
                          src={`/images/products/${prod.image_path}`}
                          sx={{ width: 56, height: 56 }}
                          onError={(e) => { 
                            console.log('Image failed to load:', e.target.src);
                            e.target.src = '/images/products/placeholder.png'; 
                          }}
                        />
                      </Grid>
                      <Grid item xs>
                        <Typography variant="h6" component="div">
                          {prod.product_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Category: {prod.category || 'N/A'}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                        Cost: R{prod.cost_of_production ? Number(prod.cost_of_production).toFixed(2) : '0.00'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Price: R{prod.selling_price ? Number(prod.selling_price).toFixed(2) : '0.00'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            Quantity: {prod.quantity || 0}
                          </Typography>
                          {prod.quantity > 0 ? (
                            <ArrowUpwardIcon sx={{ color: 'green', fontSize: 16 }} />
                          ) : (
                            <ArrowDownwardIcon sx={{ color: 'red', fontSize: 16 }} />
                          )}
                        </Box>
                      </Grid>
                      <Grid item>
                        <IconButton
                          onClick={(event) => handleMenuClick(event, prod)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      <ProductUpdateModal
        open={updateModalOpen}
        product={selectedProduct}
        onUpdate={handleUpdateComplete}
      />

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleUpdate}>Update</MenuItem>
        <MenuItem onClick={handleMenuClose}>Archive</MenuItem>
      </Menu>
    </>
  );
};

export default ProductList;