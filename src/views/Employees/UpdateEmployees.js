import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
} from "@mui/material";

const UpdateEmployees = ({ employee, onUpdate, onCancel }) => {
  const [form, setForm] = useState({
    email: employee.email || "",
    cellNo: employee.cell_no || "",
    emergencyContact: employee.emergency_contact || "",
    street: employee.street || "",
    province: employee.province || "",
    city: employee.city || "",
    postalCode: employee.postal_code || "",
    hourlyRate: employee.hourly_rate || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Call the onUpdate prop with form data
      await onUpdate(form);
    } catch (err) {
      setError("Failed to update employee.");
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Update Employee Details
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              type="email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Cell No"
              name="cellNo"
              value={form.cellNo}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Emergency Contact"
              name="emergencyContact"
              value={form.emergencyContact}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Street"
              name="street"
              value={form.street}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Province"
              name="province"
              value={form.province}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Postal Code"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Hourly Rate"
              name="hourlyRate"
              value={form.hourlyRate}
              onChange={handleChange}
              fullWidth
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Grid>
        </Grid>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Update
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default UpdateEmployees;