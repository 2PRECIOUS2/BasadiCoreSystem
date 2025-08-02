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
  Dialog,           // <-- Add this
  DialogTitle,      // <-- Add this
  DialogContent,    // <-- Add this
  Stack,            // <-- Add this
  Button,
  TextField,
  InputAdornment, Select            
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';

const MaterialList = () => {
  const [materials, setMaterials] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null); // Store the entire material object
  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [openArchive, setOpenArchive] = useState(false);
  const [searchFilter, setSearchFilter] = useState('material_name');
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
  unit: '',
  category: '',
  minQuantity: '',
});


  // A hardcoded max quantity for demonstration.
  // Ideally, this should come from your material data or a global setting.
  const maxQuantity = 100;

  const fetchMaterials = (filter = searchFilter, value = searchValue) => {
    let url = 'http://localhost:5000/api/material/all';
    const params = [];
    if (value) {
      if (filter === 'material_name') params.push(`search=${encodeURIComponent(value)}`);
      if (filter === 'category') params.push(`category=${encodeURIComponent(value)}`);
      if (filter === 'unit') params.push(`unit=${encodeURIComponent(value)}`);
    }
    if (params.length) url += '?' + params.join('&');
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setMaterials(sortedData.slice(0, 4));
      })
      .catch(error => console.error('Error fetching materials:', error));
  };


  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials(searchFilter, searchValue);
  };

  const getStockBarColor = (quantity) => {
    const percentage = (quantity / maxQuantity) * 100;
    if (percentage > 80) {
      return 'success'; // Green
    } else if (percentage > 60) {
      return 'warning'; // Orange (MUI warning color is typically orange/amber)
    } else if (percentage > 20) {
      // MUI 'info' is usually light blue. For yellow, you might need custom theme colors
      // or directly use sx={{ backgroundColor: 'yellow' }} if you don't want to customize theme.
      // For now, I'll stick to MUI's predefined colors. If you specifically need yellow,
      // consider defining it in your Material-UI theme.
      return 'info';
    } else {
      return 'error'; // Red
    }
  };

  const getStockBarValue = (quantity) => {
    return (quantity / maxQuantity) * 100;
  };

  const handleMenuClick = (event, material) => {
    setAnchorEl(event.currentTarget);
    setSelectedMaterial(material);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMaterial(null);
  };

  const handleUpdate = () => {
    if (selectedMaterial) {
       console.log(selectedMaterial); //
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
    await fetch(`http://localhost:5000/api/material/${updateData.id}`, {
      method: 'PUT',
      body: formData,
    });
    setOpenUpdate(false);
    fetchMaterials();
  } catch (error) {
    alert('Failed to update material');
  }
};

  // Function to handle "Add Stock" for a specific material
  const handleAddStock = () => {
    if (selectedMaterial) {
        console.log(`Add stock for material with ID: ${selectedMaterial.id}`);
        // TODO: Implement actual add stock logic here.
        // This might open a dedicated modal/form to input stock quantity
        // and then call an API to increment the stock for `selectedMaterial.id`.
        alert(`Implement "Add Stock" for material: ${selectedMaterial.material_name}`);
    }
    handleMenuClose();
  };

const handleArchive = () => {
  setOpenArchive(true);
  handleMenuClose();
};

const confirmArchive = async () => {
  if (selectedMaterial) {
    try {
      await fetch(`http://localhost:5000/api/material/${selectedMaterial.id}/archive`, {
        method: 'PUT',
      });
      setOpenArchive(false);
      fetchMaterials();
    } catch (error) {
      alert('Failed to archive material');
    }
  }
};

const handleCloseArchive = () => setOpenArchive(false);
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
        mt: 0, // Remove extra margin at the top
        textAlign: 'center',
        fontWeight: 700,
        letterSpacing: 1,
        color: 'black',
      }}
    >
      Existing Materials
    </Typography>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {materials.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body1">No recent materials found.</Typography>
          </Grid>
        ) : (
          materials.map((mat) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={mat.id}>
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
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 2,
      }}
    >
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
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontSize: 13,
          textAlign: 'center',
          mt: 0.5,
          letterSpacing: 1,
        }}
      >
              SKU: {mat.sku_code}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontSize: 15,
          textAlign: 'center',
          mt: 0.5,
          letterSpacing: 1,
          fontWeight: 500,
        }}
      >
       R{mat.unit_price ? Number(mat.unit_price).toFixed(2) : '0.00'}
      </Typography>
    </Box>
    <Box sx={{ width: '100%', mb: 1 }}>
      <LinearProgress
        variant="determinate"
        value={getStockBarValue(mat.quantity)}
        color={getStockBarColor(mat.quantity)}
        sx={{ height: 8, borderRadius: 5 }}
      />
      <Typography
        variant="caption"
        sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: 'text.secondary' }}
      >
        Qty: {mat.quantity}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
      <IconButton
        aria-label="settings"
        onClick={(event) => handleMenuClick(event, mat)}
        size="small"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && selectedMaterial?.id === mat.id}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleUpdate}>Update</MenuItem>
        <MenuItem onClick={handleAddStock}>Add Stock</MenuItem>
        <MenuItem onClick={handleArchive} sx={{ color: 'error.main' }}>Archive</MenuItem>
      </Menu>
    </Box>
  </Card>
</Grid>
 ))
        )}
      </Grid>
<Dialog open={openArchive} onClose={handleCloseArchive}>
  <DialogTitle>Archive Material</DialogTitle>
  <DialogContent>
    <Typography>
      Are you sure you want to archive <b>{selectedMaterial?.material_name}</b>?
    </Typography>
    <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
      <Button onClick={handleCloseArchive}>Cancel</Button>
      <Button onClick={confirmArchive} color="error" variant="contained">Archive</Button>
    </Stack>
  </DialogContent>
</Dialog>    
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

      {/* Dropdown for Category */}
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

      {/* Dropdown for Unit */}
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