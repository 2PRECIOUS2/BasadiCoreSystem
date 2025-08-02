// src/views/Products/ProductPage.js
import React, { useState } from 'react'; // Import useState
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon

import ProductForm from './ProductForm'; // Your Add New Product form
import ProductList from './ProductList'; // Your Product List
import MakeProductForm from './makeProductForm';

const ProductPage = () => {
  // State to control the visibility of the "Add New Product" form dialog
  const [openAddProductDialog, setOpenAddProductDialog] = useState(false);

  // Function to open the dialog
  const handleAddNewProduct = () => {
    setOpenAddProductDialog(true);
  };

  // Function to close the dialog
  const handleCloseAddProductDialog = () => {
    setOpenAddProductDialog(false);
    // Optionally, you might want to refresh the product list here
    // after a new product is potentially added. This would require
    // passing a callback to ProductForm.
  };

const [openMakeProductDialog, setOpenMakeProductDialog] = useState(false);

const handleMakeProducts = () => setOpenMakeProductDialog(true);
const handleCloseMakeProductDialog = () => setOpenMakeProductDialog(false);
  return (
    <Container maxWidth="lg" sx={{ pt: 2, pb: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mt: -2, // Adjust to move title up as desired
          textAlign: 'center'
        }}
      >
        Manage Products
      </Typography>

      <Grid container spacing={4}>
        {/* Top Action Buttons */}
        <Grid item xs={12} md={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-start" sx={{ mb: 3 }}>
           
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
      minWidth: 200, // Optional: set a fixed width for both buttons
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
        open={openAddProductDialog} // Controlled by state
        onClose={handleCloseAddProductDialog} // Close handler
        fullWidth // Dialog takes full width (can be 'maxWidth' for fixed size)
        maxWidth="sm" // Or 'md', 'lg' based on form size
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
        <DialogContent dividers> {/* 'dividers' adds a line below title and above actions */}
          {/* Render your ProductForm inside the dialog */}
          <ProductForm
            // You can pass props to ProductForm if needed, e.g., a callback to close the dialog
            // onFormSubmit={handleCloseAddProductDialog}
          />
        </DialogContent>
        {/* DialogActions can be added here if ProductForm doesn't have its own submit/cancel buttons */}
        {/* But usually, forms have their own buttons inside DialogContent. */}
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
    </Container>
  );
};

export default ProductPage;