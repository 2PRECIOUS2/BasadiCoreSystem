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
  CircularProgress,
  Autocomplete
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
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});

  // Legacy task system (for backward compatibility)
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [taskStaff, setTaskStaff] = useState([]);
  const [taskDeadline, setTaskDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [staffList, setStaffList] = useState([]);

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
    // Removed staffAssignment validation since staff assignment section was removed
    if (tasks.length === 0) newErrors.tasks = "At least one project task is required";
    
    if (startDate && deadline && startDate > deadline) {
      newErrors.deadline = "Deadline cannot be before start date";
    }

    // Validate task deadlines are within project timeline
    tasks.forEach((task, idx) => {
      if (task.deadline && startDate && task.deadline < startDate) {
        newErrors.tasks = "Task deadlines cannot be before project start date";
      }
      if (task.deadline && deadline && task.deadline > deadline) {
        newErrors.tasks = "Task deadlines cannot be after project deadline";
      }
    });

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
      tasks: tasks.map(t => ({
        name: t.name,
        staffId: t.assignedStaff.length > 0 ? t.assignedStaff[0] : null, // Backend currently handles single staff per task
        taskDeadline: t.deadline,
        completed: false
      })),
      additionalNotes: notes,
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
        const createdProject = await response.json();
        setSnackbar({ open: true, message: "Project created successfully!", severity: "success" });
        handleClose();
        if (onSave) onSave(createdProject);
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
    setTasks([]);
    setTaskInput("");
    setTaskStaff([]);
    setTaskDeadline("");
    setNotes("");
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

            {/* Task Management Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Assignment sx={{ color: '#667eea', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                  Project Tasks
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: '#667eea', borderWidth: 1 }} />
              
              {/* Add Task Form */}
              <Box sx={{ 
                p: 3, 
                border: '1px solid #e2e8f0', 
                borderRadius: 2, 
                mb: 3,
                backgroundColor: '#f8fafc'
              }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Add New Task
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Task Name"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Autocomplete
                      multiple
                      size="small"
                      value={staffList.filter(staff => taskStaff.includes(staff.employee_id))}
                      onChange={(event, newValue) => {
                        setTaskStaff(newValue.map(staff => staff.employee_id));
                      }}
                      options={staffList}
                      getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
                      isOptionEqualToValue={(option, value) => option.employee_id === value.employee_id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search & Assign Staff"
                          placeholder="Search employees..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#667eea' },
                              '&.Mui-focused fieldset': { borderColor: '#667eea' }
                            }
                          }}
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: '#667eea', fontSize: '0.75rem' }}>
                            {option.first_name?.charAt(0)}{option.last_name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {option.first_name} {option.last_name}
                            </Typography>
                            {option.email && (
                              <Typography variant="caption" color="textSecondary">
                                {option.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={`${option.first_name} ${option.last_name}`}
                            size="small"
                            {...getTagProps({ index })}
                            sx={{ 
                              bgcolor: '#f0f4ff', 
                              borderColor: '#667eea',
                              color: '#667eea'
                            }}
                          />
                        ))
                      }
                      noOptionsText="No employees found"
                      loading={staffList.length === 0}
                      loadingText="Loading employees..."
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Task Deadline"
                      type="date"
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      size="small"
                      inputProps={{
                        min: startDate || undefined,
                        max: deadline || undefined
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#667eea' },
                          '&.Mui-focused fieldset': { borderColor: '#667eea' }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      variant="contained"
                      onClick={handleAddTask}
                      fullWidth
                      startIcon={<AddIcon />}
                      sx={{
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a67d8, #6b46c1)'
                        }
                      }}
                    >
                      Add Task
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Tasks List */}
              {tasks.length > 0 && (
                <Box sx={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 2,
                  backgroundColor: 'white'
                }}>
                  <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 'bold', borderBottom: '1px solid #e2e8f0' }}>
                    Project Tasks ({tasks.length})
                  </Typography>
                  <List dense>
                    {tasks.map((task, idx) => (
                      <ListItem key={idx} divider={idx < tasks.length - 1}>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {task.name}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="textSecondary">
                                <strong>Assigned to:</strong>{' '}
                                {task.assignedStaff.length > 0
                                  ? task.assignedStaff
                                      .map(id => {
                                        const staff = staffList.find(s => s.employee_id === id);
                                        return staff ? `${staff.first_name} ${staff.last_name}` : id;
                                      })
                                      .join(', ')
                                  : 'Unassigned'}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                <strong>Deadline:</strong> {task.deadline}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveTask(idx)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
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

            {/* Additional Notes Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <EventNote sx={{ color: '#667eea', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                  Additional Notes (Optional)
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: '#667eea', borderWidth: 1 }} />
              
              <TextField
                label="Any additional information, requirements, or special considerations"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
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