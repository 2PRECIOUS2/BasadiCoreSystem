import React, { useState, useEffect } from "react";
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Slide,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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
      const response = await fetch("/api/employees", {
        method: "POST",
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
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Add Employee
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
          {/* Personal Information */}
          <Typography variant="h6" sx={{ mb: 2 }}>Personal Information</Typography>
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

        {/* Contact Information */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Contact Information</Typography>
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

        {/* Address Information */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Address Information</Typography>
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

        {/* Work Information */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Work Information</Typography>
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

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSave}
              sx={{ minWidth: 180, fontWeight: 600, fontSize: 18 }}
              type="button"
            >
              Submit Employee
            </Button>
          </Box>
        </Box>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default AddEmployees;