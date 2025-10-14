import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CampaignIcon from '@mui/icons-material/Campaign';

const Advertisement = () => {
  const [ads, setAds] = useState([
    {
      id: 1,
      title: 'African Print Clothing',
      category: 'Custom Clothing',
      description: 'Beautiful traditional African print clothing collection featuring vibrant patterns and authentic designs',
      image: '/images/advertisement/African Print Clothing.png',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'active'
    },
    {
      id: 2,
      title: 'Spring Collection 2025',
      category: 'Fashion Accessories',
      description: 'Fresh spring styles with African print bags and accessories',
      image: '/images/advertisement/African Print Bags.png',
      startDate: '2025-03-01',
      endDate: '2025-11-30',
      status: 'active'
    },
    {
      id: 3,
      title: 'Summer Collection 2025',
      category: 'Seasonal',
      description: 'Bright and colorful summer collection perfect for the warm season',
      image: '/images/advertisement/African Print Clothing.png',
      startDate: '2025-06-01',
      endDate: '2025-12-31',
      status: 'active'
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddNew = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      category: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'active'
    });
    setOpenDialog(true);
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      category: ad.category,
      description: ad.description,
      startDate: ad.startDate,
      endDate: ad.endDate,
      status: ad.status
    });
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      setAds(ads.filter(ad => ad.id !== id));
      setSuccess('Advertisement deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    }
    handleMenuClose();
  };

  const handleMenuOpen = (event, ad) => {
    setAnchorEl(event.currentTarget);
    setSelectedAd(ad);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAd(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.category || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    if (editingAd) {
      setAds(ads.map(ad =>
        ad.id === editingAd.id
          ? { ...ad, ...formData }
          : ad
      ));
      setSuccess('Advertisement updated successfully');
    } else {
      setAds([...ads, {
        id: Date.now(),
        ...formData,
        image: '/images/ads/placeholder.jpg'
      }]);
      setSuccess('Advertisement created successfully');
    }

    setOpenDialog(false);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
    setEditingAd(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
        px: 2
      }}
    >
      <Container maxWidth="lg">
        {/* Header Card */}
        <Box
          sx={{
            background: 'white',
            borderRadius: 4,
            p: 4,
            mb: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
              }}
            >
              <CampaignIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  letterSpacing: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textTransform: 'uppercase'
                }}
              >
                Advertisements
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 16,
                  mt: 0.5,
                  fontWeight: 500
                }}
              >
                📢 Create and manage promotional campaigns
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{
                py: 1.5,
                px: 3,
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: 15,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                  background: 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)'
                }
              }}
            >
              Create Advertisement
            </Button>

            <Button
              variant="outlined"
              sx={{
                py: 1.5,
                px: 3,
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: 15,
                borderRadius: 2,
                borderWidth: 2,
                borderColor: '#667eea',
                color: '#667eea',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: '#764ba2',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Create Template
            </Button>
          </Stack>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Advertisements Grid */}
        <Box
          sx={{
            background: 'white',
            borderRadius: 4,
            p: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 700,
              color: '#667eea',
              letterSpacing: 0.5
            }}
          >
            Active Campaigns
          </Typography>

          {ads.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CampaignIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No advertisements yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Create your first advertisement to get started
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {ads.map(ad => (
                <Grid item xs={12} sm={6} md={4} key={ad.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      border: '2px solid #f5f5f5',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={ad.image}
                      alt={ad.title}
                      sx={{
                        height: 200,
                        objectFit: 'cover',
                        backgroundColor: '#f5f5f5',
                        borderBottom: '2px solid #e0e0e0'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <Box
                      sx={{
                        height: 200,
                        backgroundColor: '#f5f5f5',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '2px solid #e0e0e0'
                      }}
                    >
                      <Typography color="text.secondary">📷 Advertisement Image</Typography>
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                          {ad.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, ad)}
                          sx={{ mt: -1 }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Category:</strong> {ad.category}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
                        {ad.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Typography variant="caption" sx={{ flex: 1, color: 'text.secondary' }}>
                          <strong>Start:</strong> {ad.startDate}
                        </Typography>
                        <Typography variant="caption" sx={{ flex: 1, color: 'text.secondary' }}>
                          <strong>End:</strong> {ad.endDate}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: ad.status === 'active' ? '#e8f5e9' : '#fff3e0',
                            color: ad.status === 'active' ? '#2e7d32' : '#f57c00',
                            fontWeight: 600
                          }}
                        >
                          {ad.status.toUpperCase()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(selectedAd)}>
          <EditIcon sx={{ mr: 1, color: '#1976d2' }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedAd.id)}>
          <DeleteIcon sx={{ mr: 1, color: '#d32f2f' }} fontSize="small" />
          Archive
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: 1
          }}
        >
          {editingAd ? 'Edit Advertisement' : 'Create Advertisement'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              name="title"
              fullWidth
              value={formData.title}
              onChange={handleFormChange}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                label="Category"
              >
                <MenuItem value="Fashion Accessories">Fashion Accessories</MenuItem>
                <MenuItem value="Custom Clothing">Custom Clothing</MenuItem>
                <MenuItem value="Seasonal">Seasonal</MenuItem>
                <MenuItem value="Flash Sale">Flash Sale</MenuItem>
                <MenuItem value="New Collection">New Collection</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleFormChange}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
              }}
            />
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              fullWidth
              value={formData.startDate}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
              }}
            />
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              fullWidth
              value={formData.endDate}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                onClick={handleCloseDialog}
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  fontWeight: 600
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                fullWidth
                sx={{
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 600
                }}
              >
                {editingAd ? 'Update' : 'Create'}
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Advertisement;