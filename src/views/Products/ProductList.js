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
  Select,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import RestoreIcon from '@mui/icons-material/Restore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';
import ProductUpdateModal from './ProductUpdateModal';

const ProductList = () => {
  const [products, setProducts] = useState([]); // Start with empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductMaterials, setSelectedProductMaterials] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  // Search/filter state
  const [searchFilter, setSearchFilter] = useState('product_name');
  const [searchValue, setSearchValue] = useState('');
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  // Archive/restore dialog state
  const [openArchive, setOpenArchive] = useState(false);
  const [openRestore, setOpenRestore] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');
  const [success, setSuccess] = useState('');

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = 'http://localhost:5000/api/products/all';
      if (statusFilter) {
        url += `?status=${encodeURIComponent(statusFilter)}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setError('Invalid response format from server');
        setProducts([]);
      }
    } catch (error) {
      setError(error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Fetch all materials for joining
    fetch('http://localhost:5000/api/material/all')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMaterialsList(data);
        } else if (data.data && Array.isArray(data.data)) {
          setMaterialsList(data.data);
        } else {
          setMaterialsList([]);
        }
      })
      .catch(() => setMaterialsList([]));
  }, [statusFilter]);

  // ✅ SAFE: Add safety check before filtering
  const filteredProducts = Array.isArray(products) ? products.filter(prod => {
    if (!prod) return false; // Skip null/undefined products
    const value = searchValue.toLowerCase();
    if (!value) return true;
    if (searchFilter === 'product_name') {
      return prod.product_name && prod.product_name.toLowerCase().includes(value);
    }
    if (searchFilter === 'category') {
      return prod.category && prod.category.toLowerCase().includes(value);
    }
    return true;
  }) : [];

  const handleMenuClick = async (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
    // Fetch materials for the selected product and join with materialsList
    if (product && product.product_id) {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${product.product_id}/materials`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          // Join with materialsList for full info
          const enriched = data.data.map(pm => {
            const mat = materialsList.find(m => m.material_id === pm.material_id);
            return {
              ...pm,
              material_name: mat ? mat.material_name : pm.material_name,
              unit_price: mat ? mat.unit_price : pm.unit_price,
              unit: mat ? mat.unit : pm.unit
            };
          });
          setSelectedProductMaterials(enriched);
        } else {
          setSelectedProductMaterials([]);
        }
      } catch (err) {
        setSelectedProductMaterials([]);
      }
    } else {
      setSelectedProductMaterials([]);
    }
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setSearchValue('');
  };

  const handleArchive = () => {
    setOpenArchive(true);
    handleMenuClose();
  };

  const handleRestore = () => {
    setOpenRestore(true);
    handleMenuClose();
  };

  const confirmArchive = async () => {
    if (!selectedProduct) return;
    try {
      const response = await fetch(`http://localhost:5000/api/products/${selectedProduct.product_id}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setSuccess('Product archived successfully');
        fetchProducts();
      } else {
        setSuccess('Failed to archive product');
      }
    } catch (error) {
      setSuccess('Network error');
    }
    setOpenArchive(false);
    setSelectedProduct(null);
  };

  const confirmRestore = async () => {
    if (!selectedProduct) return;
    try {
      const response = await fetch(`http://localhost:5000/api/products/${selectedProduct.product_id}/restore`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setSuccess('Product restored successfully');
        fetchProducts();
      } else {
        setSuccess('Failed to restore product');
      }
    } catch (error) {
      setSuccess('Network error');
    }
    setOpenRestore(false);
    setSelectedProduct(null);
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
    handleMenuClose();
  };

  const handleUpdateComplete = () => {
    fetchProducts();           // Refresh the products list
    setUpdateModalOpen(false); // Close the modal
    setSelectedProduct(null);  // Clear selected product
    setSelectedProductMaterials([]); // Clear materials
  };

  // Group products by category
  const categoryMap = {};
  filteredProducts.forEach(prod => {
    if (!prod || !prod.category) return;
    if (!categoryMap[prod.category]) categoryMap[prod.category] = [];
    categoryMap[prod.category].push(prod);
  });

  return (
    <>
      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Status Filter Tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant={statusFilter === 'active' ? 'contained' : 'outlined'}
          onClick={() => handleStatusFilterChange('active')}
          size="small"
        >
          Active Products
        </Button>
        <Button
          variant={statusFilter === 'archived' ? 'contained' : 'outlined'}
          onClick={() => handleStatusFilterChange('archived')}
          color="warning"
          size="small"
        >
          Archived Products
        </Button>
      </Box>

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

      {/* Category Sections */}
      {Object.keys(categoryMap).length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
          {statusFilter === 'archived' ? 'No archived products found.' : 'No products found.'}
        </Typography>
      ) : (
        Object.keys(categoryMap).map(category => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              {category}
            </Typography>
            <Grid container spacing={3}>
              {categoryMap[category].map(prod => {
                let imageUrl = '/images/products/placeholder.png';
                if (prod.image_path) {
                  if (prod.image_path.startsWith('/')) {
                    imageUrl = `http://localhost:5000${prod.image_path}`;
                  } else if (prod.image_path.match(/\.(png|jpg|jpeg|gif)$/i)) {
                    imageUrl = `http://localhost:5000/images/products/${prod.image_path}`;
                  } else {
                    imageUrl = '/images/products/placeholder.png';
                  }
                }
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={prod.product_id}>
                    <Card
                      elevation={2}
                      sx={{
                        borderRadius: 4,
                        p: 2,
                        height: 220,
                        minWidth: 180,
                        maxWidth: 260,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        position: 'relative',
                        background: '#fff',
                        opacity: prod.status === 'archived' ? 0.7 : 1,
                        border: prod.status === 'archived' ? '2px dashed #ff9800' : '1px solid #eee'
                         ? '2px solid #ff9800'
                         : '2px solid #1976d2', 
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        transition: 'border-color 0.2s',
                        '&:hover': {
                          borderColor: '#1565c0', // Slightly darker blue on hover
                          boxShadow: '0 4px 16px rgba(25, 118, 210, 0.15)'
                        }
                      }}
                    >
                      {/* Qty top right with arrow logic */}
                      <Box sx={{ position: 'absolute', top: 8, right: 12, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'grey.700', fontSize: 14 }}>
                          Qty : {prod.quantity || 0}
                        </Typography>
                        {(() => {
                          const qty = Number(prod.quantity) || 0;
                          if (qty < 10) {
                            return <ArrowDownwardIcon sx={{ color: 'red', fontSize: 18, ml: 0.5 }} />;
                          } else if (qty >= 10 && qty <= 30) {
                            return <ArrowUpwardIcon sx={{ color: 'red', fontSize: 18, ml: 0.5 }} />;
                          } else if (qty > 30) {
                            return <ArrowUpwardIcon sx={{ color: 'green', fontSize: 18, ml: 0.5 }} />;
                          } else {
                            return null;
                          }
                        })()}
                      </Box>
                      {/* Image center */}
                      <Box sx={{ mt: 2, mb: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <Avatar
                          variant="square"
                          src={imageUrl}
                          sx={{ width: 64, height: 64, borderRadius: 2, boxShadow: 1 }}
                          onError={(e) => { e.target.src = '/images/products/placeholder.png'; }}
                        />
                      </Box>
                      {/* Product name below image */}
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'center', mt: 1, mb: 0.5, fontSize: 16 }}>
                        {prod.product_name || 'Unnamed Product'}
                      </Typography>
                      {/* Dots for extra info (optional) */}
                      {/* <Typography variant="body2" sx={{ textAlign: 'center', color: 'grey.500', fontSize: 13 }}>...</Typography> */}
                      {/* Price bottom left */}
                      <Box sx={{ position: 'absolute', left: 12, bottom: 12 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main', fontSize: 18 }}>
                          R{prod.selling_price ? Number(prod.selling_price).toFixed(2) : '0.00'}
                        </Typography>
                      </Box>
                      {/* Context Menu Button bottom right */}
                      <Box sx={{ position: 'absolute', right: 8, bottom: 8 }}>
                        <IconButton
                          onClick={(event) => handleMenuClick(event, prod)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))
      )}

      <ProductUpdateModal
        open={updateModalOpen}
        product={selectedProduct}
        productMaterials={selectedProductMaterials}
        onUpdate={handleUpdateComplete}
      />

      {/* Context Menu */}
      <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      {selectedProduct && selectedProduct.status === 'active' ? [
        <MenuItem key="update" onClick={handleUpdate} sx={{ color: 'primary.main' }}>
          <EditIcon sx={{ mr: 1, color: '#1976d2' }} fontSize="small" />
          Update
        </MenuItem>,
        <MenuItem key="archive" onClick={handleArchive} sx={{ color: 'error.main' }}>
          <ArchiveIcon sx={{ mr: 1, color: '#d32f2f' }} fontSize="small" />
          Archive
        </MenuItem>
      ] : [
        <MenuItem key="restore" onClick={handleRestore} sx={{ color: 'success.main' }}>
          <RestoreIcon sx={{ mr: 1, color: '#388e3c' }} fontSize="small" />
          Restore
        </MenuItem>
      ]}
    </Menu>

      {/* Archive Confirmation Dialog */}
      <Dialog open={openArchive} onClose={() => setOpenArchive(false)}>
        <DialogTitle>Archive Product</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to archive <b>{selectedProduct?.product_name}</b>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>Hide the product from searches and sales</li>
            <li>Prevent new products from being made or bought</li>
            <li>Change the status to archived</li>
            <li>Product can be restored later if needed</li>
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button onClick={() => setOpenArchive(false)}>Cancel</Button>
            <Button onClick={confirmArchive} color="error" variant="contained">Archive Product</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={openRestore} onClose={() => setOpenRestore(false)}>
        <DialogTitle>Restore Product</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to restore <b>{selectedProduct?.product_name}</b>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>Make the product available for searches and sales</li>
            <li>Allow new products to be made or bought</li>
            <li>Change the status to active</li>
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button onClick={() => setOpenRestore(false)}>Cancel</Button>
            <Button onClick={confirmRestore} color="success" variant="contained">Restore Product</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductList;