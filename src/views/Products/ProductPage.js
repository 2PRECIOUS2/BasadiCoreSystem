// src/views/Products/ProductPage.js
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Stack,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BuildIcon from '@mui/icons-material/Build';
import InventoryIcon from '@mui/icons-material/Inventory';

import ProductForm from './ProductForm';
import ProductList from './ProductList';
import MakeProductForm from './MakeProductForm';
import ServiceProvidersDialog from './ServiceProvidersDialog';

const ProductPage = () => {
  const [openAddProductDialog, setOpenAddProductDialog] = useState(false);
  const [openServiceProvidersDialog, setOpenServiceProvidersDialog] = useState(false);
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
              <InventoryIcon sx={{ fontSize: 40, color: 'white' }} />
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
                Product Management
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 16,
                  mt: 0.5,
                  fontWeight: 500
                }}
              >
                🎨 Create, manage, and track your products
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNewProduct}
              sx={{
                py: 1.5,
                px: 3,
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: 15,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.4)',
                transition: 'all 0.3s ease',
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)',
                  background: 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)'
                }
              }}
            >
              New Product
            </Button>

            <Button
              variant="contained"
              startIcon={<BuildIcon />}
              onClick={handleMakeProducts}
              sx={{
                py: 1.5,
                px: 3,
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: 15,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #9c27b0 0%, #ba68c8 100%)',
                boxShadow: '0 4px 15px rgba(156, 39, 176, 0.4)',
                transition: 'all 0.3s ease',
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(156, 39, 176, 0.6)',
                  background: 'linear-gradient(90deg, #7b1fa2 0%, #ab47bc 100%)'
                }
              }}
            >
              Make Products
            </Button>

            <Button
              variant="outlined"
              startIcon={<PeopleAltIcon />}
              onClick={() => setOpenServiceProvidersDialog(true)}
              sx={{
                py: 1.5,
                px: 3,
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: 15,
                borderRadius: 2,
                borderWidth: 2,
                borderColor: '#ff9800',
                color: '#ff9800',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: '#f57c00',
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Service Providers
            </Button>
          </Stack>
        </Box>

        {/* Products List Card */}
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
            Product Catalog
          </Typography>
          <ProductList />
        </Box>
      </Container>

      {/* Add New Product Dialog */}
      <Dialog
        open={openAddProductDialog}
        onClose={handleCloseAddProductDialog}
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
            background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: 1
          }}
        >
          Add New Product
          <IconButton
            aria-label="close"
            onClick={handleCloseAddProductDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <ProductForm onProductAdded={handleCloseAddProductDialog} />
        </DialogContent>
      </Dialog>

      {/* Make Product Dialog */}
      <Dialog
        open={openMakeProductDialog}
        onClose={handleCloseMakeProductDialog}
        fullWidth
        maxWidth="md"
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
            background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: 1
          }}
        >
          Make Product
          <IconButton
            aria-label="close"
            onClick={handleCloseMakeProductDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <MakeProductForm />
        </DialogContent>
      </Dialog>

      {/* Service Providers Dialog */}
      <ServiceProvidersDialog 
        open={openServiceProvidersDialog} 
        onClose={() => setOpenServiceProvidersDialog(false)} 
      />
    </Box>
  );
};

export default ProductPage;