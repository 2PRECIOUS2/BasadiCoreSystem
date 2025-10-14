import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Select,
  Chip,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import RestoreIcon from '@mui/icons-material/Restore';
import ArchiveIcon from '@mui/icons-material/Archive';
import AddIcon from '@mui/icons-material/Add';
import MaterialForm from './MaterialForm';
import { API_BASE_URL } from '../../config';

const MaterialList = ({ refreshTrigger }) => {
  // State declarations must come first
  const [materials, setMaterials] = useState([]);
    const [createModalOpen, setCreateModalOpen] = useState(false);

  // ...existing code...
  // Helper: Shorten unit names
  const getShortUnit = (unit) => {
    if (!unit) return '';
    const map = {
      pieces: 'pcs', piece: 'pcs', pcs: 'pcs', units: 'units', unit: 'unit', items: 'items', item: 'item',
      kilograms: 'kg', kilogram: 'kg', kg: 'kg', grams: 'g', gram: 'g', g: 'g', meters: 'm', meter: 'm', m: 'm',
      liters: 'L', liter: 'L', l: 'L', cm: 'cm', ml: 'ml', rolls: 'rolls', packs: 'packs', sheets: 'sheets'
    };
    return map[unit?.toLowerCase()] || unit;
  };

  // Helper: Is unit countable?
  const isCountableUnit = (unit) => {
    if (!unit) return false;
    const countable = ['pcs', 'pieces', 'piece', 'units', 'unit', 'items', 'item', 'rolls', 'packs', 'sheets'];
    return countable.includes(unit?.toLowerCase());
  };

  // Helper: Get badge color for unit type
  const getUnitBadgeColor = (unit) => isCountableUnit(unit) ? 'primary' : 'info';

  // Helper: Highlight low stock
  const isLowStock = (quantity) => quantity < 10;

  // Sorting
  const [sortBy, setSortBy] = useState('name');
  const sortedMaterials = [...materials].sort((a, b) => {
    if (sortBy === 'name') return a.material_name.localeCompare(b.material_name);
    if (sortBy === 'quantity') return b.quantity - a.quantity;
    if (sortBy === 'price') return b.unit_price - a.unit_price;
    return 0;
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [openArchive, setOpenArchive] = useState(false);
  const [openRestore, setOpenRestore] = useState(false);
  const [searchFilter, setSearchFilter] = useState('material_name');
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // New status filter
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const maxQuantity = 100;

  const fetchMaterials = (filter = searchFilter, value = searchValue, status = statusFilter) => {
        let url = `${API_BASE_URL}/api/material/all`;
    const params = [];
    
    // Add status filter
    if (status) {
      params.push(`status=${encodeURIComponent(status)}`);
    }
    
    if (value) {
      if (filter === 'material_name') params.push(`search=${encodeURIComponent(value)}`);
      if (filter === 'category') params.push(`category=${encodeURIComponent(value)}`);
      if (filter === 'unit') params.push(`unit=${encodeURIComponent(value)}`);
    }
    
    if (params.length) url += '?' + params.join('&');
    
    fetch(url, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        // Handle both direct array and wrapped response
        const materials = Array.isArray(data) ? data : (data.data || []);
        const sortedData = materials.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setMaterials(sortedData);
      })
      .catch(error => {
        console.error('Error fetching materials:', error);
        setError('Failed to fetch materials');
        setMaterials([]); // Set empty array on error
      });
  };

  useEffect(() => {
    fetchMaterials();
  }, [statusFilter]); // Refetch when status filter changes

  // Watch for external refresh triggers
  useEffect(() => {
    if (refreshTrigger) {
      fetchMaterials();
    }
  }, [refreshTrigger]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials(searchFilter, searchValue, statusFilter);
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setSearchValue(''); // Clear search when changing status
  };

  
  const handleCreateSuccess = () => {
  setCreateModalOpen(false); // Close modal
  fetchMaterials();          // Refresh list
};

  const getStockBarColor = (quantity) => {
    const percentage = (quantity / maxQuantity) * 100;
    if (percentage > 80) return 'success';
    if (percentage > 60) return 'warning';
    if (percentage > 20) return 'info';
    return 'error';
  };

  const getStockBarValue = (quantity) => {
    return (quantity / maxQuantity) * 100;
  };

  const handleMenuClick = (event, material) => {
    setAnchorEl(event.currentTarget);
    setSelectedMaterial(material);
  };

 const handleMenuClose = (clearSelection = true) => {
  setAnchorEl(null);
  if (clearSelection) {
    setSelectedMaterial(null);
  }
};
  const handleUpdate = () => {
    if (selectedMaterial) {
      setUpdateData(selectedMaterial);
      setOpenUpdate(true);
    }
    handleMenuClose();
  };

  const handleUpdateChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async () => {
    const formData = new FormData();
    formData.append('material_name', updateData.material_name);
    formData.append('unit', updateData.unit);
    formData.append('category', updateData.category);
    if (updateData.image) {
      formData.append('image', updateData.image);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/material/${updateData.material_id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        setOpenUpdate(false);
        setSuccess('Material updated successfully');
        fetchMaterials();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update material');
      }
    } catch (error) {
      setError('Failed to update material');
    }
  };

  const handleAddStock = () => {
    if (selectedMaterial) {
      if (selectedMaterial.status === 'inactive') {
        setError('Cannot add stock to archived materials');
        setTimeout(() => setError(''), 3000);
      } else {
        console.log(`Add stock for material with ID: ${selectedMaterial.material_id}`);
        alert(`Implement "Add Stock" for material: ${selectedMaterial.material_name}`);
      }
      
    }
    handleMenuClose();
  };

  const handleArchive = () => {
  console.log('🎯 Archive button clicked!', selectedMaterial);
    setOpenArchive(true);
    handleMenuClose(false);
  };

  const confirmArchive = async () => {
  console.log('🔥 CONFIRM ARCHIVE BUTTON CLICKED!');
  console.log('📦 Selected material:', selectedMaterial);
  
  if (!selectedMaterial) {
    console.error('❌ No material selected');
    setError('No material selected');
    setTimeout(() => setError(''), 3000);
    return;
  }

  console.log('🚀 Starting archive process...');

  try {
    const url = `${API_BASE_URL}/api/material/${selectedMaterial.material_id}/archive`;
    console.log('🌐 Making request to:', url);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('📡 Raw response:', responseText);

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('✅ Success response:', result);
      setOpenArchive(false);
      setSuccess('Material archived successfully');
      fetchMaterials(); // Refresh the list
      setTimeout(() => setSuccess(''), 3000);
    } else {
      console.error('❌ Error response:', responseText);
      setError(`Failed to archive material (${response.status})`);
      setTimeout(() => setError(''), 3000);
    }
  } catch (error) {
    console.error('🚨 Network error:', error);
    setError('Network error - check if server is running');
    setTimeout(() => setError(''), 3000);
  }
};

// Add debug to dialog open state
console.log('🎭 Dialog states:', { openArchive, openRestore, selectedMaterial: selectedMaterial?.material_name });

 
  const handleRestore = () => {
    setOpenRestore(true);
    handleMenuClose(false);
  };

  const confirmRestore = async () => {
    if (selectedMaterial) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/material/${selectedMaterial.material_id}/restore`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          setOpenRestore(false);
          setSuccess('Material restored successfully');
          fetchMaterials();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to restore material');
        }
      } catch (error) {
        setError('Failed to restore material');
      }
    }
  };

  const handleCloseArchive = () => setOpenArchive(false);
  const handleCloseRestore = () => setOpenRestore(false);

  return (
    <>
      {/* Error and Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
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
          Active Materials
        </Button>
        <Button
          variant={statusFilter === 'inactive' ? 'contained' : 'outlined'}
          onClick={() => handleStatusFilterChange('inactive')}
          color="warning"
          size="small"
        >
          Archived Materials
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
          <MenuItem value="material_name">Material Name</MenuItem>
          <MenuItem value="category">Category</MenuItem>
          <MenuItem value="unit">Unit</MenuItem>
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
       
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          mt: 0,
          textAlign: 'center',
          fontWeight: 700,
          letterSpacing: 1,
          color: 'black',
        }}
      >
        {statusFilter === 'active' ? 'Active Materials' : 
         statusFilter === 'inactive' ? 'Archived Materials' : 'All Materials'}
      </Typography>

      {/* Sort Dropdown */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>Sort by:</Typography>
        <Select value={sortBy} onChange={e => setSortBy(e.target.value)} size="small" sx={{ minWidth: 120 }}>
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="quantity">Quantity</MenuItem>
          <MenuItem value="price">Price</MenuItem>
        </Select>
      </Box>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {sortedMaterials.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body1">
              {statusFilter === 'inactive' ? 'No archived materials found.' : 'No materials found.'}
            </Typography>
          </Grid>
        ) : (
          sortedMaterials.map((mat, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={mat.material_id}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  p: 2,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 8 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  opacity: mat.status === 'inactive' ? 0.7 : 1,
                  border: mat.status === 'inactive' ? '2px dashed #ff9800' : 'none'
                  ? '2px solid #ef12faff'
                  : '2px solid #1976d2',
                  bgcolor: idx % 2 === 0 ? '#f8fafc' : '#fff',
                    
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    variant="rounded"
                    src={mat.image_path ? `/images/materials/${mat.image_path}` : '/images/materials/placeholder.jpg'}
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: '#f5f5f5',
                      border: '1px solid #e0e0e0',
                      mb: 1,
                      objectFit: 'cover',
                      fontSize: 32,
                      color: '#bdbdbd',
                    }}
                  >
                    {!mat.image_path && (
                      <Box component="span" sx={{ fontSize: 32 }}>🖼️</Box>
                    )}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                    {mat.material_name}
                  </Typography>
                  {/* Category and unit in separate lines, unit in full */}
                  <Box sx={{ mt: 1, mb: 0.5, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 0.2 }}>
                      {mat.category}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: getUnitBadgeColor(mat.unit) + ".main" }}>
                      {mat.unit}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', fontSize: 13, textAlign: 'center', mt: 0.5, letterSpacing: 1 }}
                  >
                    SKU: {mat.sku_code}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontSize: 15, textAlign: 'center', letterSpacing: 1, fontWeight: 500 }}
                      title={`Unit Price: R${mat.unit_price ? Number(mat.unit_price).toFixed(2) : '0.00'}`}
                    >
                      R{mat.unit_price ? Number(mat.unit_price).toFixed(2) : '0.00'}
                    </Typography>
                    <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary', fontWeight: 400 }}>
                      per unit
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ width: '100%', mb: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={getStockBarValue(mat.quantity)}
                    color={getStockBarColor(mat.quantity)}
                    sx={{ height: 8, borderRadius: 5 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{ color: isLowStock(mat.quantity) ? 'error.main' : 'text.secondary', fontWeight: isLowStock(mat.quantity) ? 700 : 400 }}
                      title={isLowStock(mat.quantity) ? 'Low stock!' : 'Stock quantity'}
                    >
                      Qty: {mat.quantity}
                      {isLowStock(mat.quantity) && <Chip label="Low" color="error" size="small" sx={{ ml: 1 }} />}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
                  <IconButton
                    aria-label="settings"
                    onClick={(event) => handleMenuClick(event, mat)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>

                  {/* In your Menu: */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedMaterial?.material_id === mat.material_id}
                    onClose={handleMenuClose}
                  >
                    {mat.status === 'active' ? [
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
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Archive Confirmation Dialog */}
      <Dialog open={openArchive} onClose={handleCloseArchive}>
        <DialogTitle>Archive Material</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to archive <b>{selectedMaterial?.material_name}</b>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>Hide the material from searches and product creation</li>
            <li>Prevent new stock from being added</li>
            <li>Change the status to inactive</li>
            <li>Material can be restored later if needed</li>
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseArchive}>Cancel</Button>
            <Button onClick={confirmArchive} color="error" variant="contained">
              Archive Material
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={openRestore} onClose={handleCloseRestore}>
        <DialogTitle>Restore Material</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to restore <b>{selectedMaterial?.material_name}</b>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>Make the material available for searches and product creation</li>
            <li>Allow new stock to be added</li>
            <li>Change the status to active</li>
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseRestore}>Cancel</Button>
            <Button onClick={confirmRestore} color="success" variant="contained">
              Restore Material
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={openUpdate} onClose={() => setOpenUpdate(false)} fullWidth maxWidth="sm">
        <DialogTitle>Update Material</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              name="material_name"
              label="Material Name"
              fullWidth
              value={updateData.material_name || ''}
              onChange={handleUpdateChange}
            />
            <TextField label="SKU Code" value={updateData.sku_code} fullWidth disabled />
            <TextField label="Unit Price" value={updateData.unit_price} fullWidth disabled />
            <TextField label="Quantity" value={updateData.quantity} fullWidth disabled />

            <TextField
              select
              name="category"
              label="Category"
              value={updateData.category || ''}
              onChange={handleUpdateChange}
              fullWidth
            >
              <MenuItem value="Fabric & Textile">Fabric & Textile</MenuItem>
              <MenuItem value="Fasteners & Accessories">Fasteners & Accessories</MenuItem>
              <MenuItem value="Adhesives">Adhesives</MenuItem>
              <MenuItem value="Decorative Items">Decorative Items</MenuItem>
              <MenuItem value="Stationery Supplies">Stationery Supplies</MenuItem>
              <MenuItem value="Packaging">Packaging</MenuItem>
            </TextField>

            <TextField
              select
              name="unit"
              label="Unit"
              value={updateData.unit || ''}
              onChange={handleUpdateChange}
              fullWidth
            >
              <MenuItem value="meters">Meters</MenuItem>
              <MenuItem value="cm">Centimeters</MenuItem>
              <MenuItem value="items">Items</MenuItem>
              <MenuItem value="ml">Milliliters</MenuItem>
              <MenuItem value="grams">Grams</MenuItem>
              <MenuItem value="rolls">Rolls</MenuItem>
              <MenuItem value="packs">Packs</MenuItem>
              <MenuItem value="sheets">Sheets</MenuItem>
            </TextField>

            <input
              type="file"
              accept="image/*"
              onChange={e => setUpdateData({ ...updateData, image: e.target.files[0] })}
            />
            <Button onClick={handleUpdateSubmit} variant="contained">Save Changes</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MaterialList;