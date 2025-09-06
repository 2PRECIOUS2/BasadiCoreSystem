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
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

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
    country: null,        // Contact info country (code)
    addressCountry: null, // Address info country (name)
    dateOfBirth: '',
    gender: ''
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // API data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPostal, setLoadingPostal] = useState(false);

  // --- Fetch countries ---
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

  // --- Handle Contact Country (Code) Change ---
  const handleCountryChange = (event, newValue) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        country: newValue,
        countryCode: newValue.callingCode,
        addressCountry: newValue // ✅ Auto-fill address country
      }));
    } else {
      setFormData(prev => ({ ...prev, country: null, countryCode: '', addressCountry: null }));
    }
  };

  // --- Handle Address Country Change ---
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

  // --- Autofill country when user types code manually ---
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
        addressCountry: match // ✅ keep synced
      }));
    }
  }, [formData.countryCode, countries]);

  // --- Fetch states when country changes ---
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

  // --- Fetch cities when state changes ---
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

  // --- Autofill city/state from postal code ---
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

  // --- Load customer data if editing ---
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
    <Box component="form" onSubmit={handleSubmit}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: '#1976d2', fontWeight: 900, textAlign: 'center', letterSpacing: 1 }}
      >
        {customer ? 'Edit Customer' : 'Add New Customer'}
      </Typography>

      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <Grid container spacing={2}>
        {/* Personal Info */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1, color: '#1976d2' }} />Personal Information
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="firstName" label="First Name" value={formData.firstName}
            onChange={handleInputChange} error={!!errors.firstName} helperText={errors.firstName}
            fullWidth required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="lastName" label="Last Name" value={formData.lastName}
            onChange={handleInputChange} error={!!errors.lastName} helperText={errors.lastName}
            fullWidth required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="dateOfBirth" label="Date of Birth" type="date" value={formData.dateOfBirth}
            onChange={handleInputChange} error={!!errors.dateOfBirth} helperText={errors.dateOfBirth}
            fullWidth required InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="gender" label="Gender" select value={formData.gender}
            onChange={handleInputChange} error={!!errors.gender} helperText={errors.gender}
            fullWidth required>
            {genderOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
        </Grid>

        {/* Contact Info */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 1, mt: 2, display: 'flex', alignItems: 'center' }}>
            <EmailIcon sx={{ mr: 1, color: '#d81b60' }} />Contact Information
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField name="email" label="Email Address" type="email" value={formData.email}
            onChange={handleInputChange} error={!!errors.email} helperText={errors.email}
            fullWidth required />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Autocomplete
            options={countries}
            getOptionLabel={option => `${option.name} (${option.callingCode})`}
            value={formData.country}
            onChange={handleCountryChange}
            isOptionEqualToValue={(option, value) => option?.code === value?.code}
            renderInput={(params) => <TextField {...params} label="Country Code" required />}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField name="phoneNumber" label="Phone Number" value={formData.phoneNumber}
            onChange={handleInputChange} error={!!errors.phoneNumber} helperText={errors.phoneNumber}
            fullWidth required
            InputProps={{
              startAdornment: <InputAdornment position="start">{formData.countryCode}</InputAdornment>
            }} />
        </Grid>

        {/* Address Info */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 1, mt: 2, display: 'flex', alignItems: 'center' }}>
            <LocationOnIcon sx={{ mr: 1, color: '#43a047' }} />Address Information
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField name="streetAddress" label="Street Address" value={formData.streetAddress}
            onChange={handleInputChange} error={!!errors.streetAddress} helperText={errors.streetAddress}
            fullWidth required multiline rows={2} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={countries}
            getOptionLabel={option => option.name}
            value={formData.addressCountry}
            onChange={handleAddressCountryChange}
            isOptionEqualToValue={(option, value) => option?.code === value?.code}
            renderInput={(params) => <TextField {...params} label="Country" required />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="stateProvince" label="State/Province" value={formData.stateProvince}
            onChange={handleInputChange} error={!!errors.stateProvince} helperText={errors.stateProvince}
            fullWidth required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="city" label="City" value={formData.city}
            onChange={handleInputChange} error={!!errors.city} helperText={errors.city}
            fullWidth required />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="postalCode" label="Postal Code" value={formData.postalCode}
            onChange={handleInputChange} error={!!errors.postalCode} helperText={errors.postalCode}
            fullWidth InputProps={{ endAdornment: loadingPostal ? <CircularProgress size={20} /> : null }} />
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={onCancel}
              sx={{ minWidth: 120, fontWeight: 700, letterSpacing: 1 }}>Cancel</Button>
            <Button type="submit" variant="contained"
              sx={{ minWidth: 120, fontWeight: 700, letterSpacing: 1 }}>
              {customer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerForm;
