import React, { useEffect, useState } from 'react';
import {
  TextField, MenuItem, Button, Grid, Typography, Paper, Stack
} from '@mui/material';

const MakeProductForm = () => {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    method: '', // "scratch" or "provider"
    material_id: '',
    material_cost: 0,
    service_provider: '',
    service_location: '',
    service_cost: '',
    selling_price: '',
    quantity: '',
    production_date: '',
    description: '',
  });

  // Fetch product and material options
  useEffect(() => {
    fetch('http://localhost:5000/api/products') // adjust route
      .then(res => res.json())
      .then(setProducts);

    fetch('http://localhost:5000/api/material/all')
      .then(res => res.json())
      .then(setMaterials);
  }, []);

  // Calculate cost from selected material
  const calculateCost = () => {
    if (formData.method === 'scratch') {
      const material = materials.find(m => m.id === formData.material_id);
      if (material && formData.quantity) {
        return (material.unit_price * formData.quantity).toFixed(2);
      }
    } else if (formData.method === 'provider' && formData.service_cost) {
      return (formData.service_cost * formData.quantity).toFixed(2);
    }
    return 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log('Submit payload:', { ...formData, production_cost: calculateCost() });
    // Later: POST to backend
  };

  const [openMakeProductDialog, setOpenMakeProductDialog] = useState(false);

const handleMakeProducts = () => setOpenMakeProductDialog(true);
const handleCloseMakeProductDialog = () => setOpenMakeProductDialog(false);

  return (
    <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Make Product</Typography>

      <Grid container spacing={2}>
        {/* Product Dropdown */}
        <Grid item xs={12} md={6}>
          <TextField
            select fullWidth required label="Select Product"
            name="product_id" value={formData.product_id}
            onChange={handleChange}
          >
            {products.map(p => (
              <MenuItem key={p.id} value={p.id}>{p.product_name}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Method */}
        <Grid item xs={12} md={6}>
          <TextField
            select fullWidth required label="Production Method"
            name="method" value={formData.method}
            onChange={handleChange}
          >
            <MenuItem value="scratch">Made from Scratch</MenuItem>
            <MenuItem value="provider">Service Provider</MenuItem>
          </TextField>
        </Grid>

        {/* Material Fields */}
        {formData.method === 'scratch' && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                select fullWidth label="Material Used"
                name="material_id" value={formData.material_id}
                onChange={handleChange}
              >
                {materials.map(mat => (
                  <MenuItem key={mat.id} value={mat.id}>
                    {mat.material_name} (R{mat.unit_price})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Description (from product)"
                name="description" value={formData.description}
                onChange={handleChange} disabled
              />
            </Grid>
          </>
        )}

        {/* Service Provider Fields */}
        {formData.method === 'provider' && (
          <>
            <Grid item xs={6}>
              <TextField
                label="Service Provider Name" fullWidth name="service_provider"
                value={formData.service_provider} onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Location" fullWidth name="service_location"
                value={formData.service_location} onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Service Cost" type="number" fullWidth name="service_cost"
                value={formData.service_cost} onChange={handleChange}
              />
            </Grid>
          </>
        )}

        {/* Quantity, Selling Price, Total */}
        <Grid item xs={6}>
          <TextField
            label="Quantity" type="number" fullWidth name="quantity"
            value={formData.quantity} onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Selling Price" type="number" fullWidth name="selling_price"
            value={formData.selling_price} onChange={handleChange}
          />
        </Grid>

        {/* Production Date */}
        <Grid item xs={6}>
          <TextField
            label="Production Date" type="date" fullWidth
            name="production_date" InputLabelProps={{ shrink: true }}
            value={formData.production_date} onChange={handleChange}
          />
        </Grid>

        {/* Total */}
        <Grid item xs={6}>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Total Production Cost: R{calculateCost()}
          </Typography>
        </Grid>

        {/* Submit */}
        <Grid item xs={12}>
          <Button variant="contained" onClick={handleSubmit} fullWidth size="large">
            Make Product
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MakeProductForm;
