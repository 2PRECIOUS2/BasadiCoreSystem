
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
  InputAdornment,
  CircularProgress,
  Paper
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

const CustomerForm = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+27',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: null,
    addressCountry: null,
    dateOfBirth: '',
    gender: ''
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPostal, setLoadingPostal] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd');
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const countryList = data.map(c => ({
          name: c.name.common,
          code: c.cca2,
          callingCode: c.idd?.root ? `${c.idd.root}${c.idd.suffixes?.[0] || ''}` : ''
        }));
        setCountries(countryList.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error('Failed to fetch countries', err);
      }
    };
    fetchCountries();
  }, []);

  const handleCountryChange = (event, newValue) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        country: newValue,
        countryCode: newValue.callingCode,
        addressCountry: newValue
      }));
    } else {
      setFormData(prev => ({ ...prev, country: null, countryCode: '', addressCountry: null }));
    }
  };

  const handleAddressCountryChange = (event, newValue) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        addressCountry: newValue,
        stateProvince: '',
        city: ''
      }));
    }
  };

  useEffect(() => {
    if (!formData.countryCode || !countries.length) return;
    const normalizedCode = formData.countryCode.startsWith('+')
      ? formData.countryCode
      : `+${formData.countryCode}`;
    const match = countries.find(c => c.callingCode === normalizedCode);
    if (match && (!formData.country || formData.country.code !== match.code)) {
      setFormData(prev => ({
        ...prev,
        country: match,
        addressCountry: match
      }));
    }
  }, [formData.countryCode, countries]);

  useEffect(() => {
    if (!formData.addressCountry) return;
    const fetchStates = async () => {
      setLoadingStates(true);
      setStates([]);
      setFormData(prev => ({ ...prev, stateProvince: '', city: '' }));
      try {
        const res = await fetch(
          `https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${formData.addressCountry.code}/regions`,
          {
            headers: {
              'X-RapidAPI-Key': import.meta.env.VITE_GEODB_API_KEY,
              'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
            }
          }
        );
        const data = await res.json();
        setStates(data.data || []);
      } catch (err) {
        console.error(err);
      }
      setLoadingStates(false);
    };
    fetchStates();
  }, [formData.addressCountry]);

  useEffect(() => {
    if (!formData.stateProvince || !formData.addressCountry) return;
    const stateObj = states.find(s => s.name === formData.stateProvince);
    if (!stateObj) return;

    const fetchCities = async () => {
      setLoadingCities(true);
      setCities([]);
      try {
        const res = await fetch(
          `https://wft-geo-db.p.rapidapi.com/v1/geo/regions/${stateObj.code}/cities?limit=50`,
          {
            headers: {
              'X-RapidAPI-Key': import.meta.env.VITE_GEODB_API_KEY,
              'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
            }
          }
        );
        const data = await res.json();
        setCities(data.data || []);
      } catch (err) {
        console.error(err);
      }
      setLoadingCities(false);
    };
    fetchCities();
  }, [formData.stateProvince, states, formData.addressCountry]);

  useEffect(() => {
    if (!formData.postalCode || !formData.addressCountry) return;
    const fetchPostalInfo = async () => {
      setLoadingPostal(true);
      try {
        const res = await fetch(
          `https://api.zippopotam.us/${formData.addressCountry.code.toLowerCase()}/${formData.postalCode}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.places && data.places.length > 0) {
          const place = data.places[0];
          setFormData(prev => ({
            ...prev,
            city: place['place name'] || prev.city,
            stateProvince: place['state'] || prev.stateProvince
          }));
        }
      } catch (err) {
        console.error(err);
      }
      setLoadingPostal(false);
    };
    fetchPostalInfo();
  }, [formData.postalCode, formData.addressCountry]);

  useEffect(() => {
    if (customer && countries.length) {
      const contactCountry = countries.find(c => c.code === customer.countryCode) || null;
      const addrCountry = countries.find(c => c.code === customer.addressCountryCode) || null;
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
        country: contactCountry,
        addressCountry: addrCountry || contactCountry,
        dateOfBirth: customer.dateOfBirth || '',
        gender: customer.gender || ''
      });
    }
  }, [customer, countries]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!/^\d+$/.test(formData.phoneNumber.replace(/[\s-]/g, '')))
      newErrors.phoneNumber = 'Phone number should contain only digits';
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.addressCountry) newErrors.addressCountry = 'Country is required';
    if (!formData.stateProvince.trim()) newErrors.stateProvince = 'State/Province is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16 || age > 120)
        newErrors.dateOfBirth = 'Please enter a valid birth date (16-120 years old)';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitError('');
    if (validateForm()) {
      const submissionData = {
        ...formData,
        countryCode: formData.country?.code || 'ZA',
        phonePrefix: formData.countryCode,
        country: formData.country?.name || 'South Africa',
        addressCountry: formData.addressCountry?.name || 'South Africa'
      };
      onSubmit(submissionData);
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 4,
        borderRadius: 3,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
        <PersonIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
        <Typography
          variant="h4"
          sx={{ 
            color: 'white', 
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase'
          }}
        >
          {customer ? 'Edit Customer' : 'Add New Customer'}
        </Typography>
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {submitError}
        </Alert>
      )}

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Grid container spacing={3}>
          {/* Personal Information Section */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              pb: 2,
              borderBottom: '3px solid #667eea'
            }}>
              <PersonIcon sx={{ mr: 1.5, color: '#667eea', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                Personal Information
              </Typography>
            </Box>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
              }}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CakeIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
              }}
            >
              {genderOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Contact Information Section */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              pb: 2,
              mt: 2,
              borderBottom: '3px solid #f093fb'
            }}>
              <EmailIcon sx={{ mr: 1.5, color: '#f093fb', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f093fb' }}>
                Contact Information
              </Typography>
            </Box>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#f093fb' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#f093fb' },
                  '&.Mui-focused fieldset': { borderColor: '#f093fb' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#f093fb' }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Autocomplete
              options={countries}
              getOptionLabel={option => `${option.name} (${option.callingCode})`}
              value={formData.country}
              onChange={handleCountryChange}
              isOptionEqualToValue={(option, value) => option?.code === value?.code}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Country Code" 
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#f093fb' },
                      '&.Mui-focused fieldset': { borderColor: '#f093fb' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#f093fb' }
                  }}
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
                    <PhoneIcon sx={{ color: '#f093fb', mr: 0.5 }} />
                    {formData.countryCode}
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#f093fb' },
                  '&.Mui-focused fieldset': { borderColor: '#f093fb' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#f093fb' }
              }}
            />
          </Grid>

          {/* Address Information Section */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              pb: 2,
              mt: 2,
              borderBottom: '3px solid #4facfe'
            }}>
              <LocationOnIcon sx={{ mr: 1.5, color: '#4facfe', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4facfe' }}>
                Address Information
              </Typography>
            </Box>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#4facfe' },
                  '&.Mui-focused fieldset': { borderColor: '#4facfe' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#4facfe' }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={countries}
              getOptionLabel={option => option.name}
              value={formData.addressCountry}
              onChange={handleAddressCountryChange}
              isOptionEqualToValue={(option, value) => option?.code === value?.code}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Country" 
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#4facfe' },
                      '&.Mui-focused fieldset': { borderColor: '#4facfe' }
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#4facfe' }
                  }}
                />
              )}
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
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#4facfe' },
                  '&.Mui-focused fieldset': { borderColor: '#4facfe' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#4facfe' }
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#4facfe' },
                  '&.Mui-focused fieldset': { borderColor: '#4facfe' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#4facfe' }
              }}
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
              InputProps={{ 
                endAdornment: loadingPostal ? (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ) : null 
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#4facfe' },
                  '&.Mui-focused fieldset': { borderColor: '#4facfe' }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#4facfe' }
              }}
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button 
                variant="outlined" 
                onClick={onCancel}
                sx={{ 
                  minWidth: 120, 
                  fontWeight: 700, 
                  letterSpacing: 1,
                  borderWidth: 2,
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                sx={{ 
                  minWidth: 120, 
                  fontWeight: 700, 
                  letterSpacing: 1,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {customer ? 'Update Customer' : 'Add Customer'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CustomerForm;