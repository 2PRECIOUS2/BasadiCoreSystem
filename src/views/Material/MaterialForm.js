import React, { useState } from 'react';
import { TextField, Button, MenuItem, Stack, Alert, Typography, Paper } from '@mui/material';
import { Grow, Fade } from '@mui/material';

const MaterialForm = () => {
  const [material, setMaterial] = useState({
    material_name: '',
    unit: '',
    category: '',
    quantity: 0, // Quantity fixed at 0 for new additions
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setMaterial({ ...material, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
        const formData = new FormData();
    formData.append('material_name', material.material_name);
    formData.append('unit', material.unit);
    formData.append('category', material.category);
    formData.append('quantity', material.quantity);
    if (image) formData.append('image', image);
    try {
      const res = await fetch('http://localhost:5000/api/material/add', {
        method: 'POST',
        body: formData,
      });
      const data = formData;
      if (res.ok) {
        setMessage({ type: 'success', text: 'Material added successfully' });
        // Reset form fields, quantity remains 0
        setMaterial({ material_name: '', unit: '', category: '', quantity: 0 });
        // Optional: Trigger a refresh of the MaterialList if it's on the same page
        // You might need to pass a callback prop from the parent component for this.
        setImage(null);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error' });
    }
  };

  return (

    <Grow in timeout={600}>
      <Paper
       elevation={2}
       sx={{
        border: '1.5px solid #e0e0e0',
        borderRadius: 3,
        p: 3,
        background: '#fafbfc',
        mt: 0, // Remove extra margin at the top
      }}
    >
       <form onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>Add New Material</Typography>
      <Stack spacing={2}>
  <TextField
    label="Material Name"
    name="material_name"
    fullWidth
    required
    value={material.material_name}
    onChange={handleChange}
  />

  <TextField
    select
    label="Unit"
    name="unit"
    fullWidth
    required
    value={material.unit}
    onChange={handleChange}
  >
    <MenuItem value="meters">Meters</MenuItem>
    <MenuItem value="cm">Centimeters</MenuItem>
    <MenuItem value="items">Items</MenuItem>
    <MenuItem value="ml">Milliliters</MenuItem>
    <MenuItem value="grams">Grams</MenuItem>
    <MenuItem value="rolls">Rolls</MenuItem>
    <MenuItem value="packs">Packs</MenuItem>
    <MenuItem value="sheets">Sheets</MenuItem>
  </TextField>

  <TextField
    select
    label="Category"
    name="category"
    fullWidth
    required
    value={material.category}
    onChange={handleChange}
  >
    <MenuItem value="Fabric & Textile">Fabric & Textile</MenuItem>
    <MenuItem value="Fasteners & Accessories">Fasteners & Accessories</MenuItem>
    <MenuItem value="Adhesives">Adhesives</MenuItem>
    <MenuItem value="Decorative Items">Decorative Items</MenuItem>
    <MenuItem value="Stationery Supplies">Stationery Supplies</MenuItem>
    <MenuItem value="Packaging">Packaging</MenuItem>
  </TextField>

  <TextField
  label="Quantity"
  name="quantity"
  type="number"
  value={material.quantity}
  fullWidth
  disabled
  InputProps={{
                sx: { fontSize: 18, borderRadius: 2, color: 'text.secondary' }
              }}
/>

<TextField type="file" onChange={(e) => setImage(e.target.files[0])} />


          <Fade in={!!message}>
              <div>
                {message && <Alert severity={message.type}>{message.text}</Alert>}
              </div>
            </Fade>

            <Button
              variant="contained"
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
              Add Material
            </Button>
          </Stack>
        </form>
      </Paper>
    </Grow>
  );
}; 

export default MaterialForm;