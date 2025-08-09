import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  Alert,
  Typography,
  Card,
  CardContent,
  Box,
  IconButton
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const ProductUpdateModal = ({ open, onClose, product, onUpdate }) => {
  const [productDetails, setProductDetails] = useState({
    product_name: '',
    category: '',
    selling_price: 0,
  });
  const [costOfProduction, setCostOfProduction] = useState(0);
  const [originalCostOfProduction, setOriginalCostOfProduction] = useState(0); // Store original cost
  const [materialsModified, setMaterialsModified] = useState(false); // Track if materials changed
  const [productMaterials, setProductMaterials] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState(null);

  const categories = [
    'Fashion Accessories',
    'Corporate Gifts',
    'African print-inspired custom clothing',
  ];

  // Load product data when modal opens
  useEffect(() => {
    if (product && open) {
      setProductDetails({
        product_name: product.product_name || '',
        category: product.category || '',
        selling_price: Number(product.selling_price) || 0,
      });
      
      const originalCost = Number(product.cost_of_production) || 0;
      setCostOfProduction(originalCost);
      setOriginalCostOfProduction(originalCost);
      setMaterialsModified(false);
      
      // Fetch product materials
      fetchProductMaterials(product.id);
    }
  }, [product, open]);

  // Fetch materials list
  useEffect(() => {
    if (open) {
      fetch('http://localhost:5000/api/material/all')
        .then(res => res.json())
        .then(data => setMaterialsList(data))
        .catch(error => console.error('Error fetching materials:', error));
    }
  }, [open]);

  const fetchProductMaterials = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/materials`);
      
      if (!response.ok) {
        console.warn(`Materials endpoint returned ${response.status}, using default material`);
        setProductMaterials([{ materialId: '', measurement: '', unit: '', saved: false }]);
        return;
      }

      const data = await response.json();
      console.log('Fetched materials:', data); // Debug log
      
      if (data && data.length > 0) {
        const formattedMaterials = data.map(mat => ({
          id: mat.id,
          materialId: mat.material_id,
          measurement: Number(mat.measurement) || 0,
          unit: mat.unit || '',
          saved: true
        }));
        setProductMaterials(formattedMaterials);
      } else {
        setProductMaterials([{ materialId: '', measurement: '', unit: '', saved: false }]);
      }
    } catch (error) {
      console.error('Error fetching product materials:', error);
      setProductMaterials([{ materialId: '', measurement: '', unit: '', saved: false }]);
    }
  };

  const handleProductDetailsChange = (e) => {
    const { name, value } = e.target;
    setProductDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleMaterialLineChange = (index, event) => {
    const { name, value } = event.target;
    const list = [...productMaterials];
    list[index][name] = value;
    
    if (name === 'materialId') {
      const selectedMaterial = materialsList.find(m => m.id === value);
      if (selectedMaterial) {
        list[index].unit = selectedMaterial.unit;
      }
    }
    
    if (name === 'measurement' || name === 'materialId') {
      list[index].saved = false;
      setMaterialsModified(true); // Mark materials as modified
    }
    
    setProductMaterials(list);
  };

  // Enhanced cost calculation with modification tracking
  const calculateCostOfProduction = () => {
    if (!materialsModified) {
      // If materials haven't been modified, keep original cost
      setCostOfProduction(originalCostOfProduction);
      return;
    }

    let total = 0;
    productMaterials.forEach(line => {
      if (line.materialId && line.measurement > 0) {
        const mat = materialsList.find(m => m.id === line.materialId);
        if (mat && mat.unit_price) {
          const unitPrice = Number(mat.unit_price) || 0;
          const measurement = Number(line.measurement) || 0;
          total += unitPrice * measurement;
        }
      }
    });
    setCostOfProduction(total);
  };

  useEffect(() => {
    calculateCostOfProduction();
  }, [productMaterials, materialsList, materialsModified, originalCostOfProduction]);

  const handleAddMaterialLine = () => {
    setProductMaterials([...productMaterials, { materialId: '', measurement: '', unit: '', saved: false }]);
    setMaterialsModified(true);
  };

  const handleRemoveMaterialLine = (index) => {
    const list = productMaterials.filter((_, i) => i !== index);
    setProductMaterials(list.length > 0 ? list : [{ materialId: '', measurement: '', unit: '', saved: false }]);
    setMaterialsModified(true);
  };

  const prepareMaterialsForSubmission = () => {
    return productMaterials
      .filter(mat => mat.materialId && mat.measurement)
      .map(mat => {
        const selectedMaterial = materialsList.find(m => m.id === mat.materialId);
        return {
          id: mat.id || null,
          materialId: mat.materialId,
          measurement: parseFloat(mat.measurement),
          unit: selectedMaterial ? selectedMaterial.unit : ''
        };
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('product_name', productDetails.product_name);
    formData.append('category', productDetails.category);
    formData.append('cost_of_production', Number(costOfProduction) || 0);
    formData.append('selling_price', Number(productDetails.selling_price) || 0);
    formData.append('materials_modified', materialsModified.toString()); // Send modification flag
    formData.append('materials', JSON.stringify(prepareMaterialsForSubmission()));
    
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/update/${product.id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Product updated successfully!' });
        setTimeout(() => {
          onUpdate();
          onClose();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update product.' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Server error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Update Product: {product?.product_name}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            {/* Product Name */}
            <TextField
              label="Product Name"
              name="product_name"
              fullWidth
              required
              value={productDetails.product_name}
              onChange={handleProductDetailsChange}
            />

            {/* Category */}
            <TextField
              select
              label="Category"
              name="category"
              fullWidth
              required
              value={productDetails.category}
              onChange={handleProductDetailsChange}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            {/* Materials Section */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Material Used and Measurements
                  {materialsModified && (
                    <Typography variant="caption" color="primary" sx={{ ml: 1 }}>
                      (Modified - cost will be recalculated)
                    </Typography>
                  )}
                </Typography>
                {productMaterials.map((singleMaterial, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <TextField
                      select
                      label="Material"
                      name="materialId"
                      value={singleMaterial.materialId}
                      onChange={(e) => handleMaterialLineChange(index, e)}
                      sx={{ flexGrow: 1 }}
                      required
                    >
                      {materialsList.map((mat) => (
                        <MenuItem key={mat.id} value={mat.id}>
                          {mat.material_name} ({mat.unit}) - R{Number(mat.unit_price).toFixed(2)}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      label="Measurement"
                      name="measurement"
                      type="number"
                      value={singleMaterial.measurement}
                      onChange={(e) => handleMaterialLineChange(index, e)}
                      inputProps={{ min: 0, step: "any" }}
                      sx={{ width: 120 }}
                      required
                    />

                    <TextField
                      label="Unit"
                      name="unit"
                      value={singleMaterial.unit}
                      sx={{ width: 80 }}
                      InputProps={{ readOnly: true }}
                      disabled
                    />

                    {productMaterials.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveMaterialLine(index)}
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}

                <Button
                  variant="text"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleAddMaterialLine}
                  sx={{ mt: 1 }}
                >
                  Add another material
                </Button>
              </CardContent>
            </Card>

            {/* Cost of Production - Shows calculation status */}
            <Box sx={{ 
              border: '1px solid #ccc', 
              p: 2, 
              borderRadius: '4px',
              backgroundColor: materialsModified ? '#e3f2fd' : '#f5f5f5'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Cost of Production: R{(Number(costOfProduction) || 0).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {materialsModified 
                  ? '* Recalculated from modified materials' 
                  : '* Original cost (materials unchanged)'
                }
              </Typography>
            </Box>

            {/* Selling Price - EDITABLE */}
            <TextField
              label="Selling Price"
              name="selling_price"
              type="number"
              fullWidth
              required
              value={productDetails.selling_price}
              onChange={handleProductDetailsChange}
              inputProps={{ min: 0, step: "0.01" }}
            />

            {/* Current Quantity - READ-ONLY DISPLAY */}
            <Box sx={{ 
              border: '1px solid #ccc', 
              p: 2, 
              borderRadius: '4px',
              backgroundColor: '#f5f5f5' 
            }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                Current Quantity: {Number(product?.quantity) || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                * Managed by manufacturing/sales processes (read-only)
              </Typography>
            </Box>

            {/* Image Upload */}
            <TextField
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              helperText="Upload new image (optional)"
            />

            {message && <Alert severity={message.type}>{message.text}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Update Product
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductUpdateModal;