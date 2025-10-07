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
  Slide,
  Chip,
  OutlinedInput,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
  Alert,
  Paper,
  Avatar,
  Divider,
  Tooltip,
  CircularProgress
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
  EventNote,
  Schedule,
  LocationOn,
  Business,
  Assignment,
  Save,
  Group
} from "@mui/icons-material";
import { set } from "lodash";
import { API_BASE_URL } from 'src/config';

// Project categories
const categories = [
  { label: "Training Program", value: "training" },
  { label: "Handicraft Program", value: "handicraft" },
  { label: "Product Launching", value: "product" },
  { label: "Speaker Program", value: "speaker" },
];

// Transition for full screen dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateProject({ open, onClose, onSave }) {
  // Form state
  const [projectName, setProjectName] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [partner, setPartner] = useState("");
  const [description, setDescription] = useState("");
  const [staffAssignment, setStaffAssignment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});

  // Dummy staff data for development  
  const availableStaff = [
    { id: 1, name: "John Smith", role: "Project Manager" },
    { id: 2, name: "Sarah Johnson", role: "Developer" },
    { id: 3, name: "Mike Brown", role: "Designer" },
    { id: 4, name: "Lisa Davis", role: "QA Engineer" },
    { id: 5, name: "Tom Wilson", role: "Business Analyst" }
  ];

  // Legacy task system (for backward compatibility)
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [taskStaff, setTaskStaff] = useState([]);
  const [taskDeadline, setTaskDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [staffList, setStaffList] = useState([
    // Dummy staff data as fallback
    { employee_id: 'EMP001', first_name: 'John', last_name: 'Doe', email: 'john.doe@basadi.com' },
    { employee_id: 'EMP002', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@basadi.com' },
    { employee_id: 'EMP003', first_name: 'Mike', last_name: 'Johnson', email: 'mike.johnson@basadi.com' }
  ]);

  // Fetch staff from backend with proper error handling
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects/employees`, { 
          credentials: 'include' 
        });
        
        if (response.ok) {
          const data = await response.json();
          setStaffList(Array.isArray(data) ? data : []);
        } else {
          console.warn('Failed to fetch staff list, using empty array');
          setStaffList([]);
        }
      } catch (error) {
        console.warn('Error fetching staff list:', error);
        setStaffList([]);
      }
    };

    if (open) {
      fetchStaff();
    }
  }, [open]);

  // Add task with staff assignment and deadline
  const handleAddTask = () => {
    if (!taskInput.trim()) {
      setSnackbar({ open: true, message: "Task name is required.", severity: "error" });
      return;
    }
    if (!taskDeadline) {
      setSnackbar({ open: true, message: "Task deadline is required.", severity: "error" });
      return;
    }
    setTasks([
      ...tasks,
      {
        name: taskInput,
        assignedStaff: taskStaff,
        deadline: taskDeadline,
      },
    ]);
    setTaskInput("");
    setTaskStaff([]);
    setTaskDeadline("");
  };

  // Remove task
  const handleRemoveTask = (idx) => {
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  // Handle Save (submit)
  const validate = () => {
    const newErrors = {};
    if (!projectName) newErrors.projectName = "Project Name is required";
    if (!category) newErrors.category = "Category is required";
    if (!startDate) newErrors.startDate = "Start Date is required";
    if (!deadline) newErrors.deadline = "Deadline is required";
    if (!location) newErrors.location = "Location is required";
    if (!description) newErrors.description = "Project description is required";
    if (staffAssignment.length === 0) newErrors.staffAssignment = "At least one staff member must be assigned";
    
    if (startDate && deadline && startDate > deadline) {
      newErrors.deadline = "Deadline cannot be before start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      setSnackbar({ open: true, message: "Please fill in all required fields.", severity: "error" });
      return;
    }
    
    setLoading(true);
    
    const projectData = {
      projectName,
      category,
      startDate,
      deadline,
      location,
      partner,
      description,
      staffAssignment,
      status: "active"
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
        credentials: 'include'
      });
      
      if (response.ok) {
        setSnackbar({ open: true, message: "Project created successfully!", severity: "success" });
        handleClose();
        if (onSave) onSave();
      } else {
        const errorData = await response.json();
        setSnackbar({ 
          open: true, 
          message: errorData.message || "Failed to create project", 
          severity: "error" 
        });
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setSnackbar({ 
        open: true, 
        message: "Network error. Please try again.", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setProjectName("");
    setCategory("");
    setStartDate("");
    setDeadline("");
    setLocation("");
    setPartner("");
    setDescription("");
    setStaffAssignment([]);
    setErrors({});
    setLoading(false);
    onClose();
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          backgroundColor: '#f8fafc',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
      }}
    >
      <form onSubmit={handleSubmit}>
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        {/* Enhanced Header */}
        <Box sx={{ 
          bgcolor: 'rgba(255,255,255,0.95)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '3px solid #667eea',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: '#667eea', 
              width: 56, 
              height: 56,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              <WorkIcon sx={{ fontSize: 32, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                color: 'transparent',
                mb: 0.5
              }}>
                Create New Project
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Business sx={{ fontSize: 20 }} />
                Plan and organize your project workflow
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Close">
            <IconButton 
              onClick={handleClose} 
              sx={{ 
                color: '#667eea',
                '&:hover': { 
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <CloseIcon sx={{ fontSize: 30 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Main Content */}
        <Box sx={{ 
          flex: 1, 
          p: 4, 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          <Paper sx={{ 
            maxWidth: 1000, 
            width: '100%',
            p: 4,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {/* Project Details Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <EventNote sx={{ color: '#667eea', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                  Project Details
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: '#667eea', borderWidth: 1 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Project Name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                    fullWidth
                    error={!!errors.projectName}
                    helperText={errors.projectName}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#667eea', borderWidth: 2 },
                        '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Project Category</InputLabel>
                    <Select
                      value={category}
                      label="Project Category"
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      sx={{
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea', borderWidth: 2 },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea', borderWidth: 2 }
                      }}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category && (
                      <Typography color="error" variant="caption">{errors.category}</Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    required
                    error={!!errors.startDate}
                    helperText={errors.startDate}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#48bb78', borderWidth: 2 },
                        '&.Mui-focused fieldset': { borderColor: '#48bb78', borderWidth: 2 }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#48bb78' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    required
                    error={!!errors.deadline}
                    helperText={errors.deadline}
                    inputProps={{
                      min: startDate || undefined
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#ed8936', borderWidth: 2 },
                        '&.Mui-focused fieldset': { borderColor: '#ed8936', borderWidth: 2 }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#ed8936' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    fullWidth
                    required
                    error={!!errors.location}
                    helperText={errors.location}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#805ad5', borderWidth: 2 },
                        '&.Mui-focused fieldset': { borderColor: '#805ad5', borderWidth: 2 }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#805ad5' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Partner (Optional)"
                    value={partner}
                    onChange={(e) => setPartner(e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#667eea', borderWidth: 2 },
                        '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 }
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Staff Assignment Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Group sx={{ color: '#667eea', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                  Staff Assignment
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: '#667eea', borderWidth: 1 }} />
              
              <FormControl fullWidth error={!!errors.staffAssignment}>
                <InputLabel>Assign Staff Members</InputLabel>
                <Select
                  multiple
                  value={staffAssignment}
                  onChange={(e) => setStaffAssignment(e.target.value)}
                  required
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const staff = availableStaff.find(s => s.id === value);
                        return (
                          <Chip key={value} label={staff?.name || value} size="small" 
                            sx={{ 
                              bgcolor: '#667eea', 
                              color: 'white',
                              '& .MuiChip-deleteIcon': { color: 'white' }
                            }} 
                          />
                        );
                      })}
                    </Box>
                  )}
                  sx={{
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea', borderWidth: 2 },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea', borderWidth: 2 }
                  }}
                >
                  {availableStaff.map((staff) => (
                    <MenuItem key={staff.id} value={staff.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea' }}>
                          {staff.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography>{staff.name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {staff.role}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.staffAssignment && (
                  <Typography color="error" variant="caption">{errors.staffAssignment}</Typography>
                )}
              </FormControl>
            </Box>

            {/* Description Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Assignment sx={{ color: '#667eea', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                  Project Description
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: '#667eea', borderWidth: 1 }} />
              
              <TextField
                label="Describe your project goals, requirements, and deliverables"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={6}
                fullWidth
                required
                error={!!errors.description}
                helperText={errors.description}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#667eea', borderWidth: 2 },
                    '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 }
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
                }}
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              pt: 3,
              borderTop: '2px solid #e2e8f0'
            }}>
              <Button
                onClick={handleClose}
                variant="outlined"
                size="large"
                sx={{
                  borderColor: '#94a3b8',
                  color: '#64748b',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: '#64748b',
                    backgroundColor: 'rgba(100, 116, 139, 0.04)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                sx={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                  },
                  '&:disabled': {
                    background: '#94a3b8'
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
      </form>
    </Dialog>
  );
}