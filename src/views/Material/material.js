import React, { useState } from 'react';
import {
  Container,
  Typography,
  Divider,
  Grid,
  Button,
  Stack,
  Fade,
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
    <Container maxWidth="lg" sx={{ pt: 1, pb: 3 }}>
      <Fade in timeout={900}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            mt: -4,
            mb: 4,
            textAlign: 'center'
          }}
        >
          Manage Materials
        </Typography>
      </Fade>
      
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddNewMaterial}
                sx={{
                  py: 1.5,
                  px: 3,
                  fontWeight: 600,
                  letterSpacing: 1,
                  fontSize: 16,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #4caf50 60%, #81c784 100%)',
                  boxShadow: '0 2px 8px #a5d6a7',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 16px #a5d6a7',
                    background: 'linear-gradient(90deg, #388e3c 60%, #66bb6a 100%)'
                  }
                }}
              >
                Add New Material
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddNewStock}
                sx={{
                  py: 1.5,
                  px: 3,
                  fontWeight: 600,
                  letterSpacing: 1,
                  fontSize: 16,
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
                Add New Stock
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleViewInvoice}
                sx={{ 
                  py: 1.5, 
                  px: 3,
                  fontSize: 16,
                  fontWeight: 600
                }}
              >
                View Invoice
              </Button>
            </Stack>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <MaterialList maxItemsPerPage={16} />
        </Grid>
      </Grid>

      {/* Material Form Dialog */}
      <Dialog open={openMaterialForm} onClose={handleCloseMaterialForm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Add New Material
          <IconButton
            aria-label="close"
            onClick={handleCloseMaterialForm}
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
          <MaterialForm onSuccess={handleCloseMaterialForm} />
        </DialogContent>
      </Dialog>

      {/* New Stock Dialog */}
      <Dialog open={openNewStock} onClose={handleCloseNewStock} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Add New Stock
          <IconButton
            aria-label="close"
            onClick={handleCloseNewStock}
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
          <NewStock />
        </DialogContent>
      </Dialog>

      {/* Invoice List Dialog */}
      <Dialog open={openInvoiceList} onClose={handleCloseInvoiceList} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Invoices
          <IconButton
            aria-label="close"
            onClick={handleCloseInvoiceList}
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
          <InvoiceList />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default MaterialPage;
