// MODERNIZE-MUI-1.0.0/src/views/authentication/auth/AuthRegister.js

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Stack } from '@mui/system';
// REMOVE THIS LINE: import emailjs from '@emailjs/browser';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';

// RE

const AuthRegister = ({ title, subtitle, subtext }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const [emailError, setEmailError] = useState('');
const [passwordError, setPasswordError] = useState('');


  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (!firstName || !lastName || !email || !password || !role) {
      setMessage({ type: 'error', text: 'Please fill in all fields and select a role.' });
      setLoading(false);
      return;
    }

    try {
      // --- Send data to your backend API ---
      const response = await fetch('http://localhost:5000/api/register', { // Adjust port if different
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message, // Message from backend
        });
        // Clear form only on successful submission
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setRole('');
      } else {
        // Handle backend errors
        setMessage({ type: 'error', text: data.message || 'Registration failed.' });
      }
    } catch (error) {
      console.error('Error during registration request:', error);
      setMessage({ type: 'error', text: 'Failed to connect to the server. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack mb={3}>
          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="firstName" mb="5px">
            First Name
          </Typography>
          <CustomTextField
            id="firstName"
            variant="outlined"
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="lastName" mb="5px" mt="25px">
            Last Name
          </Typography>
          <CustomTextField
            id="lastName"
            variant="outlined"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="email" mb="5px" mt="25px">
            Email Address
          </Typography>
          <CustomTextField
            id="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="password" mb="5px" mt="25px">
            Password
          </Typography>
          <CustomTextField
            id="password"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="role" mb="5px" mt="25px">
            Select Role
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="accountant">Accountant</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {message && (
          <Alert severity={message.type} sx={{ mt: 2, mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Request'}
        </Button>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthRegister;