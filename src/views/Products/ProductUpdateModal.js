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
  IconButton,
  Grid
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { API_BASE_URL } from 'src/config';

const ProductUpdateModal = ({ open, onClose, product, onUpdate, productMaterials: productMaterialsProp }) => {
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

      // Use productMaterials from props if available
      if (Array.isArray(productMaterialsProp) && productMaterialsProp.length > 0) {
        const formattedMaterials = productMaterialsProp.map(mat => ({
          id: mat.material_id,
          materialId: mat.material_id,
          measurement: Number(mat.measurement) || 0,
          unit: mat.unit || '',
          material_name: mat.material_name || '',
          unit_price: mat.unit_price || '',
          saved: true
        }));
        setProductMaterials(formattedMaterials);
      } else {
        // Fallback to fetch if not provided
        fetchProductMaterials(product.product_id);
      }
    }
  }, [product, open, productMaterialsProp]);

  // Fetch materials list
  useEffect(() => {
    if (open) {
      fetch(`${API_BASE_URL}/api/material/all`, {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => setMaterialsList(data))
        .catch(error => console.error('Error fetching materials:', error));
    }
  }, [open]);

  const fetchProductMaterials = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/materials`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.warn(`Materials endpoint returned ${response.status}, using default material`);
        setProductMaterials([{ materialId: '', measurement: '', unit: '', saved: false }]);
        return;
      }

      const data = await response.json();
      console.log('Fetched materials:', data); // Debug log
      
      if (data && data.length > 0) {
        const formattedMaterials = data.map(mat => ({
          id: mat.material_id,
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
      const selectedMaterial = materialsList.find(m => m.material_id === value);
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
        const mat = materialsList.find(m => m.material_id === line.materialId);
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
        const selectedMaterial = materialsList.find(m => m.material_id === mat.materialId);
        return {
          id: mat.material_id || null,
          materialId: mat.materialId,
          measurement: parseFloat(mat.measurement),
          unit: selectedMaterial ? selectedMaterial.unit : ''
        };
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product || !product.product_id) {
      setMessage({ type: 'error', text: 'Product ID is missing. Cannot update.' });
      return;
    }
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
      const response = await fetch(`${API_BASE_URL}/api/products/${product.product_id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
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
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Update Product: {product?.product_name}</span>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <span aria-hidden="true">&times;</span>
        </IconButton>
      </DialogTitle>
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
                {/* Read-only material fields with improved UI */}
                {productMaterials.length === 0 ? (
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No materials found for this product.
                  </Typography>
                ) : (
                  <Box sx={{ mb: 2, bgcolor: '#f5f7fa', borderRadius: 3, p: 2, boxShadow: 1 }}>
                    <Grid container spacing={2} sx={{ mb: 1 }}>
                      <Grid item xs={5}><Typography sx={{ fontWeight: 600 }}>Material</Typography></Grid>
                      <Grid item xs={3}><Typography sx={{ fontWeight: 600 }}>Measurement</Typography></Grid>
                      <Grid item xs={2}><Typography sx={{ fontWeight: 600 }}>Unit</Typography></Grid>
                      <Grid item xs={2}><Typography sx={{ fontWeight: 600 }}>Unit Price</Typography></Grid>
                    </Grid>
                    {productMaterials.map((singleMaterial, index) => (
                      <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1, bgcolor: '#fff', borderRadius: 2, p: 1, border: '1px solid #e0e0e0' }}>
                        <Grid item xs={5}>
                          <TextField
                            value={singleMaterial.material_name}
                            label="Material"
                            InputProps={{ readOnly: true }}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            value={singleMaterial.measurement}
                            label="Measurement"
                            InputProps={{ readOnly: true }}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <TextField
                            value={singleMaterial.unit}
                            label="Unit"
                            InputProps={{ readOnly: true }}
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <TextField
                            value={singleMaterial.unit_price}
                            label="Unit Price"
                            InputProps={{ readOnly: true, startAdornment: <Typography sx={{ mr: 1 }}>R</Typography> }}
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    ))}
                  </Box>
                )}
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
              InputProps={{ readOnly: true }}
              sx={{ bgcolor: '#f5f5f5', fontWeight: 600 }}
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