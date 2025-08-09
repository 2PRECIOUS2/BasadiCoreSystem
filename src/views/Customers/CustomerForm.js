import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  MenuItem,
  Alert,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// International data
const countries = [
  { code: 'US', label: 'United States', phone: '+1' },
  { code: 'GB', label: 'United Kingdom', phone: '+44' },
  { code: 'CA', label: 'Canada', phone: '+1' },
  { code: 'AU', label: 'Australia', phone: '+61' },
  { code: 'DE', label: 'Germany', phone: '+49' },
  { code: 'ZA', label: 'South Africa', phone: '+27' },
  { code: 'FR', label: 'France', phone: '+33' },
  { code: 'IT', label: 'Italy', phone: '+39' },
  { code: 'ES', label: 'Spain', phone: '+34' },
  { code: 'NL', label: 'Netherlands', phone: '+31' },
  { code: 'BE', label: 'Belgium', phone: '+32' },
  { code: 'CH', label: 'Switzerland', phone: '+41' },
  { code: 'AT', label: 'Austria', phone: '+43' },
  { code: 'SE', label: 'Sweden', phone: '+46' },
  { code: 'NO', label: 'Norway', phone: '+47' },
  { code: 'DK', label: 'Denmark', phone: '+45' },
  { code: 'FI', label: 'Finland', phone: '+358' },
  { code: 'JP', label: 'Japan', phone: '+81' },
  { code: 'CN', label: 'China', phone: '+86' },
  { code: 'IN', label: 'India', phone: '+91' }
];

const genderOptions = [
  'Male',
  'Female',
  'Other',
  'Prefer not to say'
];

const CustomerForm = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+27', // Default to South Africa
    phoneNumber: '',
    streetAddress: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: { code: 'ZA', label: 'South Africa', phone: '+27' },
    dateOfBirth: '',
    gender: ''
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (customer) {
      const customerCountry = countries.find(c => c.code === customer.countryCode) || countries[5]; // Default to South Africa
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        countryCode: customer.phonePrefix || '+27',
        phoneNumber: customer.phoneNumber || '',
        streetAddress: customer.streetAddress || '',
        city: customer.city || '',
        stateProvince: customer.stateProvince || '',
        postalCode: customer.postalCode || '',
        country: customerCountry,
        dateOfBirth: customer.dateOfBirth || '',
        gender: customer.gender || ''
      });
    }
  }, [customer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCountryChange = (event, newValue) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        country: newValue,
        countryCode: newValue.phone
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d+$/.test(formData.phoneNumber.replace(/[\s-]/g, ''))) {
      newErrors.phoneNumber = 'Phone number should contain only digits';
    }
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.country) {
      newErrors.country = 'Country is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16 || age > 120) {
        newErrors.dateOfBirth = 'Please enter a valid birth date (16-120 years old)';
      }
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('🔄 Form submit triggered');
    setSubmitError('');

    console.log('📋 Current form data:', formData);

    if (validateForm()) {
      console.log('✅ Form validation passed');
      try {
        // Format data for submission
        const submissionData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          countryCode: formData.country?.code || 'ZA',
          phonePrefix: formData.countryCode,
       //   fullPhone: formData.countryCode + formData.phoneNumber,
          streetAddress: formData.streetAddress,
          city: formData.city,
          stateProvince: formData.stateProvince,
          postalCode: formData.postalCode,
          country: formData.country?.label || 'South Africa',
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
        };
        
        console.log('📤 Submitting customer data:', submissionData);
        onSubmit(submissionData);
      } catch (error) {
        console.error('❌ Error preparing submission data:', error);
        setSubmitError('Failed to save customer. Please try again.');
      }
    } else {
      console.log('❌ Form validation failed:', errors);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" component="h2" gutterBottom>
        {customer ? 'Edit Customer' : 'Add New Customer'}
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Personal Information */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            Personal Information
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="firstName"
            label="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
            fullWidth
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="lastName"
            label="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
            fullWidth
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            error={!!errors.dateOfBirth}
            helperText={errors.dateOfBirth}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="gender"
            label="Gender"
            select
            value={formData.gender}
            onChange={handleInputChange}
            error={!!errors.gender}
            helperText={errors.gender}
            fullWidth
            required
          >
            {genderOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 1, mt: 2, display: 'flex', alignItems: 'center' }}>
            <EmailIcon sx={{ mr: 1 }} />
            Contact Information
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            required
          />
        </Grid>

            <Grid item xs={12} sm={4}>
  <Autocomplete
    options={countries}
    getOptionLabel={(option) => `${option.label} (${option.phone})`}
    value={formData.country}
    onChange={handleCountryChange}
    isOptionEqualToValue={(option, value) => option.code === value.code}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Country"
        error={!!errors.country}
        helperText={errors.country}
        required
      />
    )}
  />
</Grid>

        <Grid item xs={12} sm={8}>
          <TextField
            name="phoneNumber"
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                  {formData.countryCode}
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Address Information */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 1, mt: 2, display: 'flex', alignItems: 'center' }}>
            <LocationOnIcon sx={{ mr: 1 }} />
            Address Information
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            name="streetAddress"
            label="Street Address"
            value={formData.streetAddress}
            onChange={handleInputChange}
            error={!!errors.streetAddress}
            helperText={errors.streetAddress}
            fullWidth
            required
            multiline
            rows={2}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="city"
            label="City"
            value={formData.city}
            onChange={handleInputChange}
            error={!!errors.city}
            helperText={errors.city}
            fullWidth
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="stateProvince"
            label="State/Province"
            value={formData.stateProvince}
            onChange={handleInputChange}
            error={!!errors.stateProvince}
            helperText={errors.stateProvince}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="postalCode"
            label="Postal Code"
            value={formData.postalCode}
            onChange={handleInputChange}
            error={!!errors.postalCode}
            helperText={errors.postalCode}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={4}>
  <Autocomplete
    options={countries}
    getOptionLabel={(option) => option.label}
    value={formData.country}
    onChange={handleCountryChange}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Country"
        error={!!errors.country}
        helperText={errors.country}
        required
      />
    )}
  />
</Grid>

        {/* Form Actions */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{ minWidth: 120 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ minWidth: 120 }}
            >
              {customer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerForm;