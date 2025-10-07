import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box
} from '@mui/material';
import MaterialForm from './MaterialForm';
import MaterialList from './MaterialList';
import InvoiceList from './InvoiceList';
import NewStock from './newStock';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';

const MaterialPage = () => {
  const [openNewStock, setOpenNewStock] = useState(false);
  const [openInvoiceList, setOpenInvoiceList] = useState(false);
  const [openMaterialForm, setOpenMaterialForm] = useState(false);

  const handleAddNewStock = () => setOpenNewStock(true);
  const handleCloseNewStock = () => setOpenNewStock(false);

  const handleAddNewMaterial = () => setOpenMaterialForm(true);
  const handleCloseMaterialForm = () => setOpenMaterialForm(false);

  const handleViewInvoice = () => setOpenInvoiceList(true);
  const handleCloseInvoiceList = () => setOpenInvoiceList(false);

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
                Material Management
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 16,
                  mt: 0.5,
                  fontWeight: 500
                }}
              >
                📦 Track and manage your inventory efficiently
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNewMaterial}
              sx={{
                py: 1.5,
                px: 3,
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: 15,
                borderRadius: 2,
                background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                transition: 'all 0.3s ease',
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.6)',
                  background: 'linear-gradient(90deg, #388e3c 0%, #66bb6a 100%)'
                }
              }}
            >
              New Material
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNewStock}
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
              New Stock
            </Button>

            <Button
              variant="outlined"
              startIcon={<ReceiptIcon />}
              onClick={handleViewInvoice}
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
              Invoices
            </Button>
          </Stack>
        </Box>

        {/* Materials List Card */}
        <Box
          sx={{
            background: 'white',
            borderRadius: 4,
            p: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
        >
          <MaterialList maxItemsPerPage={16} />
        </Box>
      </Container>

      {/* Material Form Dialog */}
      <Dialog 
        open={openMaterialForm} 
        onClose={handleCloseMaterialForm} 
        maxWidth="sm" 
        fullWidth
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
          Add New Material
          <IconButton
            aria-label="close"
            onClick={handleCloseMaterialForm}
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
          <MaterialForm onSuccess={handleCloseMaterialForm} />
        </DialogContent>
      </Dialog>

      {/* New Stock Dialog */}
      <Dialog 
        open={openNewStock} 
        onClose={handleCloseNewStock} 
        maxWidth="lg" 
        fullWidth
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
          Add New Stock
          <IconButton
            aria-label="close"
            onClick={handleCloseNewStock}
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
          <NewStock />
        </DialogContent>
      </Dialog>

      {/* Invoice List Dialog */}
      <Dialog 
        open={openInvoiceList} 
        onClose={handleCloseInvoiceList} 
        maxWidth="md" 
        fullWidth
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
          Invoices
          <IconButton
            aria-label="close"
            onClick={handleCloseInvoiceList}
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
          <InvoiceList />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MaterialPage;