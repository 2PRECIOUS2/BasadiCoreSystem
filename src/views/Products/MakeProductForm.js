import React, { useEffect, useState } from 'react';
import {
  TextField, MenuItem, Button, Grid, Typography, Paper, Box, Divider, Alert, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { API_BASE_URL } from 'src/config';

const MakeProductForm = ({ onProductMade }) => {
  const [products, setProducts] = useState([]);
  const [productMaterials, setProductMaterials] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    method: '',
    quantity: '',
    production_date: '',
    provider_id: '',
    service_cost: '',
  });
  const [totalCost, setTotalCost] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [serviceProviders, setServiceProviders] = useState([]);
  const [productCost, setProductCost] = useState(0);

useEffect(() => {
  fetch(`${API_BASE_URL}/api/service-providers`, {
    credentials: "include",
  })
    .then(res => res.json())
    .then(data => setServiceProviders(data.data || []))
    .catch(() => setServiceProviders([]));
}, []);

useEffect(() => {
  fetch(`${API_BASE_URL}/api/products/all`, {
    credentials: "include",
  })
    .then(res => res.json())
    .then(data => setProducts(data.data || []))
    .catch(() => setProducts([]))
    .finally(() => setLoading(false));
}, []);

useEffect(() => {
  if (formData.product_id && formData.method === "scratch") {
    fetch(`${API_BASE_URL}/api/products/${formData.product_id}/materials`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setProductMaterials(data.data || []))
      .catch(() => setProductMaterials([]));
  } else {
    setProductMaterials([]);
  }
}, [formData.product_id, formData.method]);

useEffect(() => {
  if (formData.product_id) {
    fetch(`${API_BASE_URL}/api/products/${formData.product_id}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        setProductCost(data.data?.cost_of_production || 0);
      })
      .catch(() => setProductCost(0));
  } else {
    setProductCost(0);
  }
}, [formData.product_id]);
// ...existing code...

useEffect(() => {
  if (formData.method === 'scratch' && formData.quantity) {
    setTotalCost((parseFloat(productCost) * parseInt(formData.quantity)).toFixed(2));
  } else if (formData.method === 'provider' && formData.service_cost && formData.quantity) {
    setTotalCost((parseFloat(formData.service_cost) * parseInt(formData.quantity)).toFixed(2));
  } else {
    setTotalCost('0.00');
  }
}, [formData.quantity, formData.method, productCost, formData.service_cost]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.method) {
      setError('Please select a production method.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      const payload = {
      product_id: formData.product_id,
      production_method: formData.method,
      quantity: parseInt(formData.quantity),
      production_date: formData.production_date,
      total_cost: parseFloat(totalCost),
      materials_used: formData.method === 'scratch' ? productMaterials.map(material => ({
        material_id: material.material_id,
        measurement: material.measurement,
        unit: material.unit,
        unit_price: material.unit_price
      })) : [],
      provider_id: formData.method === 'provider' ? formData.provider_id : null,
      cost_of_production: formData.method === 'provider'
        ? parseFloat(formData.service_cost)
        : parseFloat(productCost)
    };
        
      console.log('Submitting production payload:', payload);
      
      const response = await fetch(`${API_BASE_URL}/api/production`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setSuccess('Product manufacturing record created successfully!');
        setFormData({
          product_id: '',
          method: '',
          quantity: '',
          production_date: '',
          provider_id: '',
          service_cost: '',
        });
        setProductMaterials([]);
        setTimeout(() => setSuccess(''), 3000);
        if (onProductMade) {
          onProductMade(); // Call parent function to refresh products
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create production record');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('Error submitting form');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <Paper elevation={4} sx={{
        p: 5,
        maxWidth: 600,
        mx: 'auto',
        mt: 6,
        borderRadius: 4,
        bgcolor: '#f8fafc'
      }}>
        <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 700 }}>
          Make Product
        </Typography>
        <Typography>Loading products...</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={4} sx={{
      p: 5,
      maxWidth: 600,
      mx: 'auto',
      mt: 6,
      borderRadius: 4,
      bgcolor: '#f8fafc'
    }}>
      <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 700 }}>
        Make Product
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            select fullWidth required label="Product Name"
            name="product_id" value={formData.product_id}
            onChange={handleChange}
            size="large"
            sx={{ fontSize: 20 }}
          >
            {products.map(p => (
              <MenuItem key={p.product_id} value={p.product_id}>
                {p.product_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            select fullWidth required label="Production Method"
            name="method" value={formData.method}
            onChange={handleChange}
            size="large"
          >
            <MenuItem value="scratch">Made from Scratch</MenuItem>
            <MenuItem value="provider">Service Provider</MenuItem>
          </TextField>
        </Grid>

        {/* Always show material fields for 'scratch' method, display message if none found */}

{formData.method === 'scratch' && (
  <Grid item xs={12}>
    <Box sx={{ mt: 2, mb: 2 }}>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Materials Used
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={3}><Typography sx={{ fontWeight: 600 }}>Material Name</Typography></Grid>
        <Grid item xs={3}><Typography sx={{ fontWeight: 600 }}>Measurement</Typography></Grid>
        <Grid item xs={2}><Typography sx={{ fontWeight: 600 }}>Unit</Typography></Grid>
        <Grid item xs={4}><Typography sx={{ fontWeight: 600 }}>Unit Price</Typography></Grid>
      </Grid>
      {productMaterials.length > 0 ? (
        productMaterials.map((mat, idx) => (
          <Grid container spacing={2} key={mat.product_material_id || idx} alignItems="center" sx={{ mb: 1 }}>
            <Grid item xs={3}>
              <TextField
                value={mat.material_name}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                value={mat.measurement}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                value={mat.unit}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                value={mat.unit_price}
                fullWidth
                InputProps={{ readOnly: true, startAdornment: <Typography sx={{ mr: 1 }}>R</Typography> }}
                variant="outlined"
              />
            </Grid>
          </Grid>
        ))
      ) : (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No materials found for this product.
        </Typography>
      )}
      {/* Cost of Production (per unit) */}
      <TextField
        label="Cost of Production (per unit)"
        value={productCost}
        fullWidth
        InputProps={{ readOnly: true }}
        variant="outlined"
        sx={{ mt: 2 }}
      />
    </Box>
  </Grid>
)}

        {/* Show service provider fields for 'provider' method immediately after Production Method */}
        {formData.method === 'provider' && (
          <Grid item xs={12}>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Service Provider
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                  <TextField
                    select
                    label="Service Provider Name"
                    name="provider_id"
                    value={formData.provider_id}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    {serviceProviders.map(sp => (
                      <MenuItem key={sp.provider_id} value={sp.provider_id}>
                        {sp.provider_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Service Cost"
                    name="service_cost"
                    type="number"
                    value={formData.service_cost}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth required label="Quantity"
            name="quantity" type="number"
            value={formData.quantity}
            onChange={handleChange}
            size="large"
            inputProps={{ min: 1 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth required label="Production Date"
            name="production_date" type="date"
            value={formData.production_date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            size="large"
          />
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{
            p: 2,
            bgcolor: '#e0f7fa',
            borderRadius: 2,
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 600,
            color: 'primary.main'
          }}>
            Total Cost: R{totalCost}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ py: 2, fontSize: 18, fontWeight: 700 }}
            disabled={
              !formData.product_id ||
              !formData.method ||
              !formData.quantity ||
              !formData.production_date
            }
            onClick={handleSubmit}
          >
            Make Product Stock
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MakeProductForm;