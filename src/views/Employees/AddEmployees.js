import React, { useState, useEffect } from "react";
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  TextField,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slide,
  Snackbar,
  Alert,
  Paper,
  Avatar,
  Divider
} from "@mui/material";
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  ContactPhone as ContactIcon,
  Home as HomeIcon,
  Work as WorkIcon
} from "@mui/icons-material";
import axios from "axios";
import { API_BASE_URL } from 'src/config';
import zaCities from "./za.json";

// Employment types and roles for dropdowns
const employmentTypes = [
  { label: "Permanent", value: "Permanent" },
  { label: "Temporary", value: "Temporary" },
];

const roles = [
  "Trainer",
  "Administrator",
  "Accountant",
  "Support"
];

const provinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape"
];

// Transition for full screen dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function AddEmployees({ open, onClose, onSave }) {

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});
   const validate = () => {
    const newErrors = {};
    if (!firstName) newErrors.firstName = "First Name is required";
    if (!lastName) newErrors.lastName = "Last Name is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required";
    if (!email) newErrors.email = "Email is required";
    if (!cellNo) newErrors.cellNo = "Cell Number is required";
    if (!emergencyContact) newErrors.emergencyContact = "Emergency Contact Number is required";
    if (!street) newErrors.street = "Street Name is required";
    if (!province) newErrors.province = "Province is required";
    if (!city) newErrors.city = "City/Town is required";
    if (!postalCode) newErrors.postalCode = "Postal Code is required";
    if (!role) newErrors.role = "Role is required";
    if (!employmentType) newErrors.employmentType = "Employment Type is required";
    if (!hourlyRate) newErrors.hourlyRate = "Hourly Rate is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");


  // Contact Info
  const [email, setEmail] = useState("");
  const [cellNo, setCellNo] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Address Info
  const [street, setStreet] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [cities, setCities] = useState([]);

  // Work Info
  const [role, setRole] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  // Fetch South African cities
  useEffect(() => {
  setCities(zaCities);
}, []);

// Before your city dropdown


  const handleClose = () => {
    setFirstName("");
    setLastName("");
    setGender("");
    setDateOfBirth("");
    setEmail("");
    setCellNo("");
    setEmergencyContact("");
    setStreet("");
    setProvince("");
    setCity("");
    setPostalCode("");
    setRole("");
    setHourlyRate("");
    setEmploymentType("");
    if (onClose) onClose();
  };

  // Filter cities by selected province (normalize for case and whitespace)
  const filteredCities = province
    ? cities.filter((c) =>
        c.admin_name &&
        c.admin_name.trim().toLowerCase() === province.trim().toLowerCase() &&
        c.city // Only include entries with a city name
      )
    : [];

  console.log(filteredCities);

  const handleSave = async () => {
    if (!validate()) {
      setSnackbar({ open: true, message: "Please fill in all required fields.", severity: "error" });
      return;
    }
    const employee = {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      email,
      cellNo,
      emergencyContact,
      street,
      province,
      city,
      postalCode,
      role,
      hourlyRate,
      employmentType,
      employmentStatus: "active",
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    });
       if (response.ok) {
    const data = await response.json();
    setSnackbar({ open: true, message: "Employee successfully created!", severity: "success" });
    if (onSave) onSave(data);
    setTimeout(() => {
      if (onClose) onClose();
    }, 1200);
  } else {
    const errorData = await response.json();
    setSnackbar({
      open: true,
      message: errorData.error || "Failed to create employee.",
      severity: "error"
    });
  }
} catch (err) {
  setSnackbar({ open: true, message: "Failed to create employee.", severity: "error" });
}
};

  return (
    <>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        {/* Enhanced Header with Gradient */}
        <AppBar sx={{ 
          position: "relative",
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
        }}>
          <Toolbar sx={{ py: 1 }}>
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              mr: 2,
              width: 48,
              height: 48
            }}>
              <PersonAddIcon sx={{ color: 'white', fontSize: 28 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Add New Employee
              </Typography>
              <Typography variant="subtitle1" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: '400'
              }}>
                Create a new employee profile for your team
              </Typography>
            </Box>
            <IconButton 
              edge="end" 
              color="inherit" 
              onClick={handleClose}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        {/* Enhanced Content with Gradient Background */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: 'calc(100vh - 80px)',
          p: 4
        }}>
          <Paper sx={{ 
            p: 4, 
            maxWidth: 1000, 
            mx: "auto",
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
          {/* Personal Information Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ bgcolor: '#667eea', width: 40, height: 40 }}>
                <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                  Personal Information
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Basic employee details and identity
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 3, bgcolor: '#667eea', height: 2 }} />
          <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              fullWidth
              margin="normal"
              error={!!errors.firstName}
              helperText={errors.firstName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              fullWidth
              margin="normal"
              error={!!errors.lastName}
              helperText={errors.lastName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" error={!!errors.gender}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={gender}
                label="Gender"
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {errors.gender && <Typography color="error" variant="caption">{errors.gender}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={!!errors.dateOfBirth}
              helperText={errors.dateOfBirth}
            />
          </Grid>
        </Grid>
        </Box>

        {/* Contact Information Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: '#48bb78', width: 40, height: 40 }}>
              <ContactIcon sx={{ color: 'white', fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                Contact Information
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Communication and emergency contact details
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3, bgcolor: '#48bb78', height: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              margin="normal"
              type="email"
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Cell Number"
              value={cellNo}
              onChange={(e) => setCellNo(e.target.value)}
              required
              fullWidth
              margin="normal"
              error={!!errors.cellNo}
              helperText={errors.cellNo}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Emergency Contact Number"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              required
              fullWidth
              margin="normal"
              error={!!errors.emergencyContact}
              helperText={errors.emergencyContact}
            />
          </Grid>
        </Grid>
        </Box>

        {/* Address Information Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: '#ed8936', width: 40, height: 40 }}>
              <HomeIcon sx={{ color: 'white', fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                Address Information
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Residential address and location details
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3, bgcolor: '#ed8936', height: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Street Name"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
              fullWidth
              margin="normal"
              error={!!errors.street}
              helperText={errors.street}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" error={!!errors.province}>
              <InputLabel>Province</InputLabel>
              <Select
                value={province}
                label="Province"
                onChange={(e) => {
                  setProvince(e.target.value);
                  setCity(""); // Reset city when province changes
                }}
                required
              >
                {provinces.map((prov) => (
                  <MenuItem key={prov} value={prov}>
                    {prov}
                  </MenuItem>
                ))}
              </Select>
              {errors.province && <Typography color="error" variant="caption">{errors.province}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" error={!!errors.city}>
              <InputLabel>City/Town</InputLabel>
              <Select
                value={city}
                label="City/Town"
                onChange={(e) => setCity(e.target.value)}
                required
                disabled={!province}
              >
                {province && filteredCities.length > 0
                  ? filteredCities.map((c, idx) => (
                      <MenuItem key={c.city + '-' + idx} value={c.city}>
                        {c.city}
                      </MenuItem>
                    ))
                  : <MenuItem value="">{province ? "No cities found" : "Select a province first"}</MenuItem>
                }
              </Select>
              {errors.city && <Typography color="error" variant="caption">{errors.city}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Postal Code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
              fullWidth
              margin="normal"
              type="text"
              error={!!errors.postalCode}
              helperText={errors.postalCode}
            />
          </Grid>
        </Grid>
        </Box>

        {/* Work Information Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: '#9f7aea', width: 40, height: 40 }}>
              <WorkIcon sx={{ color: 'white', fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                Work Information
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Employment details and compensation
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3, bgcolor: '#9f7aea', height: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="normal" error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
                required
              >
                {roles.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
              {errors.role && <Typography color="error" variant="caption">{errors.role}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth margin="normal" error={!!errors.employmentType}>
              <InputLabel>Employment Type</InputLabel>
              <Select
                value={employmentType}
                label="Employment Type"
                onChange={(e) => setEmploymentType(e.target.value)}
                required
              >
                {employmentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.employmentType && <Typography color="error" variant="caption">{errors.employmentType}</Typography>}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Hourly Rate"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              required
              fullWidth
              margin="normal"
              type="number"
              inputProps={{ min: 0 }}
              error={!!errors.hourlyRate}
              helperText={errors.hourlyRate}
            />
          </Grid>
        </Grid>
        </Box>

          {/* Enhanced Submit Button */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSave}
              startIcon={<PersonAddIcon />}
              sx={{
                py: 2,
                px: 6,
                fontWeight: 'bold',
                fontSize: 18,
                borderRadius: 2,
                minWidth: 250,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8, #667eea)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
                }
              }}
            >
              Create Employee Profile
            </Button>
          </Box>
          </Paper>
        </Box>
      </Dialog>
      
      {/* Enhanced Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            width: "100%",
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            fontWeight: 'bold'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default AddEmployees;