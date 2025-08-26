import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, MenuItem, Typography, IconButton, Stack } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

const NewStock = () => {
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
        alert('Stock added and invoice generated!');
        // Reset
        setStockItems([{ material_id: '', supplier_name: '', quantity: '', price_bought: '', unit_price: 0 }]);
        setPurchaseDate('');
        setTotalCost(0);
      } else {
        alert(data.message || 'Error submitting stock');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  return (
    <Stack spacing={3}  sx={{ maxWidth: 1500, margin: '0 auto' }}>
      <Typography variant="h5" sx={{ fontSize: '2rem' }}>New Stock</Typography>

      {stockItems.map((item, index) => (
        <Grid container spacing={2} key={index}>
          <Grid item xs={2}>
            <TextField
                      select
                      label="Select Material"
                      fullWidth
                      value={item.material_id}
                      onChange={(e) => handleChange(index, 'material_id', e.target.value)}
                      InputProps={{ sx: { fontSize: 16, height: 56 } }}
                      InputLabelProps={{ sx: { fontSize: 16 } }}
                    >
                      {materials.map((mat) => (
                        <MenuItem key={mat.material_id} value={mat.material_id} sx={{ fontSize: 18 }}>
                          {mat.material_name} {mat.unit ? `(${mat.unit})` : ''}
                        </MenuItem>
                      ))}
              </TextField>
          </Grid>

            <Grid item xs={3}>
              <TextField
              label="Supplier Name"
              fullWidth
              value={item.supplier_name}
              onChange={(e) => handleChange(index, 'supplier_name', e.target.value)}
              InputProps={{ sx: { fontSize: 16, height: 56 } }}
              InputLabelProps={{ sx: { fontSize: 16 } }}
            />
          </Grid>

          <Grid item xs={2}>
           <TextField
                label="Quantity"
                type="number"
                fullWidth
                value={item.quantity}
                onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                inputProps={{
                  step: "any", // allows decimals and integers
                  min: 0
                }}
                InputProps={{ sx: { fontSize: 18, height: 56 } }}
                InputLabelProps={{ sx: { fontSize: 18 } }}
              />
            </Grid>

          <Grid item xs={3}>
            <TextField
              label="Total Price Bought by"
              type="number"
              fullWidth
              value={item.price_bought}
              onChange={(e) => handleChange(index, 'price_bought', e.target.value)}
              InputProps={{ sx: { fontSize: 16, height: 56 } }}
              InputLabelProps={{ sx: { fontSize: 16 } }}
            />
          </Grid>

          <Grid item xs={2}>
            <TextField label="Unit Price" disabled value={item.unit_price} fullWidth InputProps={{ sx: { fontSize: 16, height: 56 } }}
          InputLabelProps={{ sx: { fontSize: 16 } }} />
          </Grid>

          <Grid item xs={12} sm={1}>
            <IconButton color="error" onClick={() => removeRow(index)} disabled={stockItems.length === 1}>
              <Remove />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Button startIcon={<Add />} onClick={addRow}>Add Stock Row</Button>

      <TextField
        label="Purchase Date"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        value={purchaseDate}
        onChange={(e) => setPurchaseDate(e.target.value)}
      />

      <Typography variant="h6">Total: R{totalCost}</Typography>

      <Button variant="contained" color="primary" onClick={handleSubmit}>Submit Stock & Generate Invoice</Button>
    </Stack>
  );
};

export default NewStock;
