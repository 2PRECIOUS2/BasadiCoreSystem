import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
  Button,
  Stack,
  Alert,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDefaultRoute } from '../../utils/rbac';
import { API_BASE_URL } from 'src/config';

const AuthLogin = ({ title, subtitle, subtext, setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();
  
  // Form state
  const [loginType, setLoginType] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  
  // Field-specific errors
  const [loginTypeError, setLoginTypeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [employeeIdError, setEmployeeIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Reset all errors
    setLoginTypeError('');
    setEmailError('');
    setEmployeeIdError('');
    setPasswordError('');

    // Validation
    let hasError = false;
    
    if (!loginType) { 
      setLoginTypeError('Please select a login type'); 
      hasError = true; 
    }
    
    if (!email) { 
      setEmailError('Email is required'); 
      hasError = true; 
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      hasError = true;
    }
    
    if (loginType === 'super_admin' && !password) { 
      setPasswordError('Password is required'); 
      hasError = true; 
    }
    
    if (loginType === 'employee' && !employeeId) { 
      setEmployeeIdError('Employee ID is required'); 
      hasError = true; 
    } else if (loginType === 'employee' && isNaN(employeeId)) {
      setEmployeeIdError('Employee ID must be a number');
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    try {
      const requestBody = {
        loginType,
        email: email.toLowerCase().trim(), // normalize email
        ...(loginType === 'super_admin' && { password }),
        ...(loginType === 'employee' && { employeeId: Number(employeeId) })
      };

      console.log('🧾 Sending login request:', requestBody);

      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage('Login successful!');
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('sessionId', data.sessionId);
        
        if (setIsAuthenticated) setIsAuthenticated(true);
        if (setUser) setUser(data.user);
        
        // Redirect based on role permissions
        const target = getDefaultRoute();
        setTimeout(() => navigate(target), 1200);
      } else {
        setError(data.message || `Login failed (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      {title && (
        <Box mb={2}>
          <Typography fontWeight="700" variant="h2" mb={1}>
            {title}
          </Typography>
          {subtext && (
            <Typography variant="subtitle1" color="textSecondary">
              {subtext}
            </Typography>
          )}
        </Box>
      )}

      {/* Custom subtext for this component */}
      {subtext}

      <Stack spacing={3} sx={{ mt: 2 }}>
        {/* Login Type Selection */}
        <FormControl fullWidth error={!!loginTypeError}>
          <InputLabel>Login Type</InputLabel>
          <Select
            value={loginType}
            label="Login Type"
            onChange={(e) => setLoginType(e.target.value)}
          >
            <MenuItem value="employee">Employee Login</MenuItem>
            <MenuItem value="super_admin">Super Admin Login</MenuItem>
          </Select>
          {loginTypeError && <FormHelperText>{loginTypeError}</FormHelperText>}
        </FormControl>

        {/* Email Field */}
        <FormControl fullWidth error={!!emailError}>
          <InputLabel htmlFor="email">Email</InputLabel>
          <OutlinedInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            placeholder="Enter your email"
          />
          {emailError && <FormHelperText>{emailError}</FormHelperText>}
        </FormControl>

        {/* Employee ID Field - only show for employee login */}
        {loginType === 'employee' && (
          <FormControl fullWidth error={!!employeeIdError}>
            <InputLabel htmlFor="employeeId">Employee ID</InputLabel>
            <OutlinedInput
              id="employeeId"
              type="number"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              label="Employee ID"
              placeholder="Enter your Employee ID"
            />
            {employeeIdError && <FormHelperText>{employeeIdError}</FormHelperText>}
          </FormControl>
        )}

        {/* Password Field - only show for super admin login */}
        {loginType === 'super_admin' && (
          <FormControl fullWidth error={!!passwordError}>
            <InputLabel htmlFor="password">Password</InputLabel>
            <OutlinedInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              placeholder="Enter your password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
            {passwordError && <FormHelperText>{passwordError}</FormHelperText>}
          </FormControl>
        )}

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}

        {/* Login Button */}
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            py: 1.5,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a67d8, #667eea)',
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Sign In'
          )}
        </Button>
      </Stack>

      {/* Subtitle */}
      {subtitle}
    </>
  );
};

export default AuthLogin;
