import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, MenuItem, Typography, IconButton, Stack, Snackbar, Alert } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

const NewStock = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [materials, setMaterials] = useState([]);
  const [stockItems, setStockItems] = useState([
    { material_id: '', supplier_name: '', quantity: '', price_bought: '', unit_price: 0 },
  ]);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5000/api/material/all')
      .then(res => res.json())
      .then(data => setMaterials(data));
  }, []);

  const handleChange = (index, field, value) => {
    const newItems = [...stockItems];
    newItems[index][field] = value;

    // Auto calculate unit_price when both quantity & price_bought are available
    const { quantity, price_bought } = newItems[index];
    if (quantity && price_bought) {
      newItems[index].unit_price = (parseFloat(price_bought) / parseInt(quantity)).toFixed(2);
    }

    setStockItems(newItems);
    updateTotal(newItems);
  };

  const updateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price_bought || 0));
    }, 0);
    setTotalCost(total.toFixed(2));
  };

  const addRow = () => {
    setStockItems([...stockItems, { material_id: '', supplier_name: '', quantity: '', price_bought: '', unit_price: 0 }]);
  };

  const removeRow = (index) => {
    const updated = [...stockItems];
    updated.splice(index, 1);
    setStockItems(updated);
    updateTotal(updated);
  };

  const handleSubmit = async () => {
    const payload = {
      stockItems,
      purchaseDate,
      totalCost,
    };

    try {
      const res = await fetch('http://localhost:5000/api/stock/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setSnackbar({ open: true, message: 'Stock added and invoice generated!', severity: 'success' });
        // Reset
        setStockItems([{ material_id: '', supplier_name: '', quantity: '', price_bought: '', unit_price: 0 }]);
        setPurchaseDate('');
        setTotalCost(0);
      } else {
        setSnackbar({ open: true, message: data.message || 'Error submitting stock', severity: 'error' });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Server error', severity: 'error' });
    }
  };

  return (
  <Stack spacing={4} sx={{ width: '100%', maxWidth: 1200, minWidth: 400, bgcolor: '#f5faff', p: 4, borderRadius: 4, boxShadow: 4, mx: 'auto', my: 'auto', position: 'relative' }}>
      <Typography variant="h4" sx={{ fontWeight: 900, color: '#1976d2', letterSpacing: 1, mb: 2, display: 'flex', alignItems: 'center' }}>
        <Add sx={{ fontSize: 36, mr: 1 }} /> Add New Stock
      </Typography>

      {stockItems.map((item, index) => (
        <Grid container spacing={3} key={index} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <TextField
              select
              label={<span style={{ fontWeight: 700 }}><Add sx={{ fontSize: 20, color: '#1976d2', mr: 0.5 }} />Select Material</span>}
              fullWidth
              value={item.material_id}
              onChange={(e) => handleChange(index, 'material_id', e.target.value)}
              InputProps={{ sx: { fontSize: 20, height: 56, fontWeight: 700 } }}
              InputLabelProps={{ sx: { fontSize: 20, fontWeight: 700 } }}
            >
              {materials.map((mat) => (
                <MenuItem key={mat.material_id} value={mat.material_id} sx={{ fontSize: 20, fontWeight: 700 }}>
                  {mat.material_name} {mat.unit ? `(${mat.unit})` : ''}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

            <Grid item xs={3}>
              <TextField
                label={<span style={{ fontWeight: 700 }}><Add sx={{ fontSize: 20, color: '#43a047', mr: 0.5 }} />Supplier Name</span>}
                fullWidth
                value={item.supplier_name}
                onChange={(e) => handleChange(index, 'supplier_name', e.target.value)}
                InputProps={{ sx: { fontSize: 18, height: 56, fontWeight: 700 } }}
                InputLabelProps={{ sx: { fontSize: 18, fontWeight: 700 } }}
              />
            </Grid>

          <Grid item xs={2}>
            <TextField
              label={<span style={{ fontWeight: 700 }}><Add sx={{ fontSize: 20, color: '#fbc02d', mr: 0.5 }} />Quantity</span>}
              type="number"
              fullWidth
              value={item.quantity}
              onChange={(e) => handleChange(index, 'quantity', e.target.value)}
              inputProps={{ step: "any", min: 0 }}
              InputProps={{ sx: { fontSize: 18, height: 56, fontWeight: 700 } }}
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 700 } }}
            />
          </Grid>

          <Grid item xs={2}>
            <TextField
              label={<span style={{ fontWeight: 700 }}><Add sx={{ fontSize: 20, color: '#d81b60', mr: 0.5 }} />Total Price Bought by</span>}
              type="number"
              fullWidth
              value={item.price_bought}
              onChange={(e) => handleChange(index, 'price_bought', e.target.value)}
              InputProps={{ sx: { fontSize: 16, height: 56, fontWeight: 700 } }}
              InputLabelProps={{ sx: { fontSize: 16, fontWeight: 700 } }}
            />
    <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%', fontSize: 18, fontWeight: 700 }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
          </Grid>

          <Grid item xs={2}>
            <TextField label={<span style={{ fontWeight: 700 }}><Add sx={{ fontSize: 20, color: '#1976d2', mr: 0.5 }} />Unit Price</span>} disabled value={item.unit_price} fullWidth InputProps={{ sx: { fontSize: 18, height: 56, fontWeight: 700 } }}
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 700 } }} />
          </Grid>

          <Grid item xs={12} sm={1}>
            <IconButton color="error" onClick={() => removeRow(index)} disabled={stockItems.length === 1} sx={{ bgcolor: '#fff', border: '2px solid #d81b60', p: 1 }}>
              <Remove sx={{ fontSize: 28, color: '#d81b60' }} />
            </IconButton>
          </Grid>
        </Grid>
      ))}

  <Button startIcon={<Add sx={{ fontSize: 24 }} />} onClick={addRow} sx={{ fontWeight: 900, fontSize: 18, bgcolor: '#1976d2', color: '#fff', borderRadius: 2, boxShadow: 2, py: 1, px: 3, '&:hover': { bgcolor: '#1565c0' } }}>Add Stock Row</Button>

      <TextField
        label={<span style={{ fontWeight: 700 }}><Add sx={{ fontSize: 20, color: '#43a047', mr: 0.5 }} />Purchase Date</span>}
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true, sx: { fontSize: 18, fontWeight: 700 } }}
        value={purchaseDate}
        onChange={(e) => setPurchaseDate(e.target.value)}
        sx={{ fontSize: 18, fontWeight: 700, height: 56 }}
      />

  <Typography variant="h5" sx={{ fontWeight: 900, color: '#1976d2', letterSpacing: 1, mt: 2 }}>Total: R{totalCost}</Typography>

  <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ fontWeight: 900, fontSize: 18, py: 1.5, borderRadius: 2, boxShadow: 2, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}>SUBMIT STOCK & GENERATE INVOICE</Button>
  </Stack>
  );
};

export default NewStock;
