import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Stack,
  Alert,
  Typography,
  IconButton,
  Card,
  CardContent,
  Box,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // For the '+' icon
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'; // To remove a material line

const ProductForm = () => {
  const [productDetails, setProductDetails] = useState({
    product_name: '',
    quantity: 0,
    selling_price: 0,
    category: '', // New state for category
  });
  const [materialsList, setMaterialsList] = useState([]); // List of materials from the DB
  const [productMaterials, setProductMaterials] = useState([ // State for materials used in THIS product
    { materialId: '', measurement: '', unit: '', saved: false } // Each object represents one material line
  ]);
  const [costOfProduction, setCostOfProduction] = useState(0); // This will initially be 0

  const [message, setMessage] = useState(null);
  
  const [image, setImage] = useState(null);

  // Define categories
  const categories = [
    'Fashion Accessories',
    'Corporate Gifts',
    'African print-inspired custom clothing',
  ];

  // Common input styles for consistency and thickness
  const commonInputSx = {
    '& .MuiInputBase-input': {
      fontWeight: 'bold',
    },
    '& .MuiInputLabel-root': { // For the label
      fontWeight: 'bold',
    },
  };


  // --- Fetch Materials from Database ---
  useEffect(() => {
    fetch('http://localhost:5000/api/material/all') // Assuming this endpoint works
      .then(res => res.json())
      .then(data => setMaterialsList(data))
      .catch(error => console.error('Error fetching materials for ProductForm:', error));
  }, []);

  // --- Handlers for Product Details ---
  const handleProductDetailsChange = (e) => {
    const { name, value } = e.target;
    setProductDetails(prev => ({ ...prev, [name]: value }));
  };

  // --- Handlers for Product Materials ---
  const handleMaterialLineChange = (index, event) => {
    const { name, value } = event.target;
    const list = [...productMaterials];
    list[index][name] = value;

      // When material changes, also capture its unit
  if (name === 'materialId') {
    const selectedMaterial = materialsList.find(m => m.material_id === value);
    if (selectedMaterial) {
      list[index].unit = selectedMaterial.unit;
    }
  }
    // Reset saved status if measurement changes for that line
    if (name === 'measurement' || name === 'materialId') {
      list[index].saved = false;
    }
    setProductMaterials(list);
  };

  const handleAddMaterialLine = () => {
    setProductMaterials([...productMaterials, { materialId: '', measurement: '', unit: '', saved: false }]);
  };

  const handleRemoveMaterialLine = (index) => {
    const list = [...productMaterials];
    list.splice(index, 1);
    setProductMaterials(list);
    // TODO: Re-calculate cost of production here if a material line is removed
    // For now, just a placeholder:
    setCostOfProduction(0);
  };

  const handleSaveMaterialLine = (index) => {
    // This button will eventually trigger calculation of cost of production
    // based on material price and measurement.
    // For now, it just marks the line as "saved" (UI placeholder)
    const list = [...productMaterials];
    list[index].saved = true;
    setProductMaterials(list);

    // TODO: Implement actual cost calculation here
    //alert(`Material line ${index + 1} saved. Calculate cost of production.`);
    // For now, just a placeholder:
    //setCostOfProduction(prevCost => prevCost + 10); // Dummy cost increase
  };

// --- Cost of Production Calculation ---
const calculateCostOfProduction = () => {
  let total = 0;
  productMaterials.forEach(line => {
    if (line.materialId && line.measurement > 0) {
      const mat = materialsList.find(m => m.material_id === line.materialId);
      if (mat && mat.unit_price) {
        total += parseFloat(mat.unit_price) * parseFloat(line.measurement);
      }
    }
  });
  setCostOfProduction(total);
};

// Call this function whenever productMaterials or materialsList changes:
useEffect(() => {
  calculateCostOfProduction();
  // eslint-disable-next-line
}, [productMaterials, materialsList]);

const prepareMaterialsForSubmission = () => {
  return productMaterials
    .filter(mat => mat.materialId && mat.measurement)
    .map(mat => {
      const selectedMaterial = materialsList.find(m => m.material_id === mat.materialId);
      return {
        materialId: mat.materialId,
        measurement: parseFloat(mat.measurement),
        unit: selectedMaterial ? selectedMaterial.unit : ''
      };
    });
};

  // --- Main Form Submission ---
  const handleAddProductSubmit = async (e) => {
  e.preventDefault();

 const formData = new FormData();
  formData.append('product_name', productDetails.product_name);
  formData.append('category', productDetails.category);
  formData.append('cost_of_production', costOfProduction);
  formData.append('selling_price', productDetails.selling_price);
  formData.append('quantity', productDetails.quantity || 0);
  formData.append('materials', JSON.stringify(prepareMaterialsForSubmission()));
  
  if (image) {
    formData.append('image', image);
  }

  try {
    const response = await fetch('http://localhost:5000/api/products/add', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      setMessage({ type: 'success', text: 'Product added successfully!' });
      setProductDetails({ product_name: '', selling_price: 0, category: '', quantity: 0 });
      setProductMaterials([{ materialId: '', measurement: '', unit: '', saved: false }]);
      setCostOfProduction(0);
      setImage(null);
    //if (onProductAdded) {
          //onProductAdded(); // Call parent function to refresh products
   // }
    } else {
      setMessage({ type: 'error', text: 'Failed to add product.' });
    }
  } catch (error) {
    setMessage({ type: 'error', text: 'Error adding product.' });
  }
};

  return (
    <form onSubmit={handleAddProductSubmit}>
      <Stack spacing={3}> {/* Increased spacing for better visual separation */}

        {/* Product Name */}
        <TextField
          label="Product Name"
          name="product_name"
          fullWidth
          required
          value={productDetails.product_name}
          onChange={handleProductDetailsChange}
          sx={commonInputSx}
        />

        {/* Category Dropdown */}
        <TextField
          select
          label="Category"
          name="category"
          fullWidth
          required
          value={productDetails.category}
          onChange={handleProductDetailsChange}
          sx={commonInputSx}
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>


        {/* Material Used and Measurements Section */}
        <Card variant="outlined" sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>Material Used and Measurements</Typography>
            {productMaterials.map((singleMaterial, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                {/* Material Dropdown */}
                <TextField
                  select
                  label="Material"
                  name="materialId"
                  value={singleMaterial.materialId}
                  onChange={(e) => handleMaterialLineChange(index, e)}
                  sx={{ flexGrow: 1, ...commonInputSx }} // Allow material field to grow
                  required
                >
                  {materialsList.length > 0 ? (
                    materialsList.map((mat) => (
                      <MenuItem key={mat.material_id} value={mat.material_id}>
                        {mat.material_name} ({mat.unit})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No materials found</MenuItem>
                  )}
                </TextField>

                {/* Measurement Input */}
                <TextField
                  label="Measurement"
                  name="measurement"
                  type="number"
                  value={singleMaterial.measurement}
                  onChange={(e) => handleMaterialLineChange(index, e)}
                  inputProps={{ min: 0, step: "any" }}
                  sx={{ width: 180, ...commonInputSx }} // Increased width for measurement
                  required
                />

                  {/* Unit Input - Auto-filled and readonly */}
                <TextField
                  label="Unit"
                  name="unit"
                  value={singleMaterial.unit}
                  sx={{ width: 100, ...commonInputSx }}
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled
                />

                {/* Save Button for Material Line */}
                <Button
                  variant={singleMaterial.saved ? "outlined" : "contained"}
                  size="small"
                  onClick={() => handleSaveMaterialLine(index)}
                  disabled={!singleMaterial.materialId || singleMaterial.measurement <= 0}
                >
                  {singleMaterial.saved ? "Saved" : "Save"}
                </Button>

                {/* Remove Material Line Button */}
                {productMaterials.length > 1 && (
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveMaterialLine(index)}
                    aria-label="remove material line"
                  >
                    <RemoveCircleOutlineIcon />
                  </IconButton>
                )}
              </Box>
            ))}

            {/* Add New Material Line Button */}
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

        
        {/* Quantity (for clarity) */}
        <TextField
          label="Quantity (Initial stock - will change when products are made)"
          name="quantity"
          type="number"
          fullWidth
          disabled
          value={productDetails.quantity}
          onChange={handleProductDetailsChange}
          inputProps={{ min: 0, step: "1" }}
       
        />

        {/* Cost of Production */}
        <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: '4px', mt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Cost of Production: R{costOfProduction.toFixed(2)}
          </Typography>
        </Box>


        {/* Selling Price */}
        <TextField
          label="Selling Price"
          name="selling_price"
          type="number"
          fullWidth
          required
          value={productDetails.selling_price}
          onChange={handleProductDetailsChange}
          inputProps={{ min: 0, step: "0.01" }} // Allow decimal for currency
          sx={commonInputSx}
        />

        <TextField
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
           inputProps={{ accept: 'image/*' }}
        />

        {message && <Alert severity={message.type}>{message.text}</Alert>}

        {/* Main Add Product Button */}
        <Button variant="contained" type="submit" size="large">
          Add Product
        </Button>
      </Stack>
    </form>
  );
};

export default ProductForm;