// src/views/Products/ProductPage.js
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  Box,
  Divider,
  Dialog,        // Import Dialog
  DialogTitle,   // Import DialogTitle
  DialogContent, // Import DialogContent
  IconButton,    // Import IconButton for the close button
}
from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { useNavigate } from 'react-router-dom';

import ProductForm from './ProductForm';
import ProductList from './ProductList';
import MakeProductForm from './makeProductForm';
import ServiceProvidersDialog from './ServiceProvidersDialog';

const ProductPage = () => {
  const [openAddProductDialog, setOpenAddProductDialog] = useState(false);
  const [openServiceProvidersDialog, setOpenServiceProvidersDialog] = useState(false);
  // Remove products state, ProductList will fetch products itself
  const [openMakeProductDialog, setOpenMakeProductDialog] = useState(false);

  const handleAddNewProduct = () => {
    setOpenAddProductDialog(true);
  };

  const handleCloseAddProductDialog = () => {
    setOpenAddProductDialog(false);
  };

  const handleMakeProducts = () => setOpenMakeProductDialog(true);
  const handleCloseMakeProductDialog = () => setOpenMakeProductDialog(false);
  return (
    <Container maxWidth="lg" sx={{ pt: 2, pb: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mt: -2,
          textAlign: 'center'
        }}
      >
        Manage Products
      </Typography>

      <Grid container spacing={4}>
        {/* Top Action Buttons */}
        <Grid item xs={12} md={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddNewProduct}
              type="submit"
              sx={{
                py: 1.5,
                fontWeight: 600,
                letterSpacing: 1,
                fontSize: 18,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)',
                boxShadow: '0 2px 8px #90caf9',
                transition: 'transform 0.18s, box-shadow 0.18s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 16px #90caf9',
                  background: 'linear-gradient(90deg, #1565c0 60%, #42a5f5 100%)'
                }
              }}
            >
              Add New Product
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleMakeProducts}
              sx={{
                py: 1.5,
                px: 3,
                minWidth: 200,
                fontWeight: 600,
                letterSpacing: 1,
                fontSize: 18,
                borderRadius: 2,
                transition: 'transform 0.18s, box-shadow 0.18s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 16px #90caf9',
                  borderColor: '#1565c0'
                }
              }}
            >
              Make Products
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<PeopleAltIcon sx={{ color: '#ff9800', fontSize: 28 }} />}
              sx={{
                py: 1.5,
                px: 3,
                minWidth: 220,
                fontWeight: 600,
                letterSpacing: 1,
                fontSize: 18,
                borderRadius: 2,
                transition: 'transform 0.18s, box-shadow 0.18s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 16px #ff9800',
                  borderColor: '#ff9800',
                  background: '#fff3e0'
                }
              }}
              onClick={() => setOpenServiceProvidersDialog(true)}
            >
              Service Providers
            </Button>
          </Stack>
        </Grid>

        {/* Existing Products List */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Existing Products
          </Typography>
          <ProductList />
        </Grid>
      </Grid>

      {/* Add New Product Dialog */}
      <Dialog
        open={openAddProductDialog}
        onClose={handleCloseAddProductDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Add New Product
          <IconButton
            aria-label="close"
            onClick={handleCloseAddProductDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <ProductForm onProductAdded={handleCloseAddProductDialog} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openMakeProductDialog}
        onClose={handleCloseMakeProductDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Make Product
          <IconButton
            aria-label="close"
            onClick={handleCloseMakeProductDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <MakeProductForm />
        </DialogContent>
      </Dialog>
      <ServiceProvidersDialog open={openServiceProvidersDialog} onClose={() => setOpenServiceProvidersDialog(false)} />
    </Container>
  );
};

export default ProductPage;