import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Box,
  Stack,
  Alert,
  TextField,
  Slide
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ServiceProvidersDialog = ({ open, onClose }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Fetch providers
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('http://localhost:5000/api/service-providers')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setProviders(data.data);
        } else {
          setProviders([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProviders([]);
        setLoading(false);
        setError('Failed to fetch service providers');
      });
  }, [open, success]);

  // Menu actions
  const handleMenuClick = (event, provider) => {
    setAnchorEl(event.currentTarget);
    setSelectedProvider(provider);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProvider(null);
  };

  // Archive provider
  const handleArchive = async () => {
    if (!selectedProvider) return;
    try {
      const res = await fetch(`http://localhost:5000/api/service-providers/${selectedProvider.provider_id}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setSuccess('Service provider archived');
      } else {
        setSuccess('Failed to archive');
      }
    } catch {
      setSuccess('Network error');
    }
    handleMenuClose();
  };

  // Update provider (stub)
  const handleUpdate = () => {
    // Open update dialog/modal (not implemented here)
    setSuccess('Update not implemented');
    handleMenuClose();
  };

  // Add provider (stub)
  const handleAddProvider = () => {
    setAddDialogOpen(true);
  };
  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
    >
      <DialogTitle>
        Service Providers
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="warning"
            startIcon={<PeopleAltIcon sx={{ color: '#fff', fontSize: 24 }} />}
            onClick={handleAddProvider}
            sx={{ fontWeight: 600, letterSpacing: 1, fontSize: 16, borderRadius: 2 }}
          >
            Add New Service Provider
          </Button>
        </Stack>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        {loading ? (
          <Typography>Loading service providers...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={3}>
            {providers.length === 0 ? (
              <Grid item xs={12}><Typography>No service providers found.</Typography></Grid>
            ) : (
              providers.map(provider => (
                <Grid item xs={12} sm={6} md={4} key={provider.provider_id}>
                  <Card elevation={2} sx={{ borderRadius: 3, p: 2, position: 'relative' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {provider.provider_name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        {provider.provider_location}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {provider.provider_email}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {provider.provider_number}
                      </Typography>
                    </CardContent>
                    <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
                      <IconButton onClick={e => handleMenuClick(e, provider)} size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
        {/* Add Provider Dialog (stub) */}
        <Dialog open={addDialogOpen} onClose={handleAddDialogClose} fullWidth maxWidth="sm">
          <DialogTitle>
            Add New Service Provider
            <IconButton
              aria-label="close"
              onClick={handleAddDialogClose}
              sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name');
                const location = formData.get('location');
                const contact_number = formData.get('contact_number');
                const email = formData.get('email');
                try {
                  const res = await fetch('http://localhost:5000/api/service-providers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, location, contact_number, email })
                  });
                  if (res.ok) {
                    setSuccess('Service provider added');
                    setAddDialogOpen(false);
                  } else {
                    setSuccess('Failed to add service provider');
                  }
                } catch {
                  setSuccess('Network error');
                }
              }}
            >
              <TextField name="name" label="Provider Name" required fullWidth />
              <TextField name="location" label="Location" required fullWidth />
              <TextField name="contact_number" label="Contact Number" required fullWidth />
              <TextField name="email" label="Email" type="email" required fullWidth />
              <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                <Button onClick={handleAddDialogClose}>Cancel</Button>
                <Button type="submit" variant="contained" color="warning">Add Provider</Button>
              </Stack>
            </Box>
          </DialogContent>
        </Dialog>
        {/* Action Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleUpdate}>Update</MenuItem>
          <MenuItem onClick={handleArchive} sx={{ color: 'error.main' }}>Archive</MenuItem>
        </Menu>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceProvidersDialog;
