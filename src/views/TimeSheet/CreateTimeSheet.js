import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Paper,
  Avatar,
  Divider,
  Alert,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  AccessTime as AccessTimeIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import timesheetService from '../../services/timesheetService';

const CreateTimeSheet = ({ open, onClose, onSave }) => {
  // Get current user from localStorage/session
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Auto-fill employee information from logged-in user
  const [employeeInfo, setEmployeeInfo] = useState({
    employee_id: '',
    role: '',
    first_name: '',
    last_name: ''
  });

  // Form state - only store what goes to database
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date
    start_time: '',
    end_time: '',
    break_start: '',
    break_end: '',
    work_done: '',
    project_id: null // Optional
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto-fill employee data when dialog opens or user changes
  useEffect(() => {
    if (open && currentUser) {
      setEmployeeInfo({
        employee_id: currentUser.employeeId || currentUser.employee_id || '',
        role: currentUser.role || 'Employee',
        first_name: currentUser.firstName || currentUser.first_name || '',
        last_name: currentUser.lastName || currentUser.last_name || ''
      });
      
      // Reset form to today's date
      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0]
      }));
    }
  }, [open, currentUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const setCurrentTime = (field) => {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5); // HH:MM format
    handleInputChange(field, timeString);
  };

  const calculateBreakDuration = () => {
    if (formData.break_start && formData.break_end) {
      const start = new Date(`2000-01-01T${formData.break_start}:00`);
      const end = new Date(`2000-01-01T${formData.break_end}:00`);
      const diffMinutes = (end - start) / (1000 * 60);
      return Math.max(0, diffMinutes);
    }
    return 0;
  };

  const calculateTotalHours = () => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}:00`);
      const end = new Date(`2000-01-01T${formData.end_time}:00`);
      const diffHours = (end - start) / (1000 * 60 * 60);
      const breakDuration = calculateBreakDuration();
      return Math.max(0, diffHours - (breakDuration / 60));
    }
    return 0;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate employee info is available
    if (!employeeInfo.employee_id) {
      newErrors.employee_id = 'Employee information not found. Please re-login.';
    }
    
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (!formData.work_done?.trim()) newErrors.work_done = 'Work description is required';
    
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = 'End time must be after start time';
    }
    
    if (formData.break_start && formData.break_end && formData.break_start >= formData.break_end) {
      newErrors.break_end = 'Break end time must be after break start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const breakDuration = calculateBreakDuration();
      
      // Prepare data for database - only include what should be stored
      const timesheetData = {
        // employee_id will be set automatically by backend from session
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        break_duration: breakDuration,
        work_done: formData.work_done.trim(),
        status: 'draft'
        // project_id is optional and can be null
      };

      console.log('Creating timesheet for employee:', employeeInfo.employee_id);
      console.log('Timesheet data:', timesheetData);
      
      const response = await timesheetService.createTimesheet(timesheetData);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSave?.(response.data);
          onClose();
          setSuccess(false);
          // Reset form but keep employee info
          setFormData({
            date: new Date().toISOString().split('T')[0],
            start_time: '',
            end_time: '',
            break_start: '',
            break_end: '',
            work_done: '',
            project_id: null
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating timesheet:', error);
      setErrors({ submit: error.message || 'Failed to create timesheet' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
    setSuccess(false);
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
      }}
    >
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        {/* Header */}
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
              <ScheduleIcon sx={{ fontSize: 32, color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                color: 'transparent',
                mb: 0.5
              }}>
                Create Timesheet
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AccessTimeIcon sx={{ fontSize: 20 }} />
                Track your daily work hours and activities
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={handleClose}
            sx={{ 
              color: '#667eea',
              minWidth: 'auto',
              p: 1,
              '&:hover': { 
                bgcolor: 'rgba(102, 126, 234, 0.1)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <CloseIcon sx={{ fontSize: 30 }} />
          </Button>
        </Box>

        {/* Content */}
        <Box sx={{ 
          flex: 1, 
          p: 4, 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          <Paper sx={{ 
            maxWidth: 800, 
            width: '100%',
            p: 4,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <form onSubmit={handleSubmit}>
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Timesheet created successfully! 🎉
                </Alert>
              )}

              {errors.submit && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {errors.submit}
                </Alert>
              )}

              {/* Employee Information - Auto-filled & Read-only */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <PersonIcon sx={{ color: '#667eea', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                    Employee Information
                  </Typography>
                  <Chip 
                    label="Auto-filled" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#e6fffa', 
                      color: '#38a169',
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>
                <Divider sx={{ mb: 3, borderColor: '#667eea', borderWidth: 1 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Employee ID"
                      value={employeeInfo.employee_id || 'Not Found'}
                      disabled
                      fullWidth
                      error={!!errors.employee_id}
                      helperText={errors.employee_id}
                      InputProps={{
                        startAdornment: <BadgeIcon sx={{ color: '#667eea', mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: employeeInfo.employee_id ? '#f0fff4' : '#fef2f2',
                          '& fieldset': { 
                            borderColor: employeeInfo.employee_id ? '#38a169' : '#e53e3e',
                            borderWidth: 2
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '56px' }}>
                      <WorkIcon sx={{ color: '#667eea' }} />
                      <Box>
                        <Typography variant="body2" color="textSecondary">Role</Typography>
                        <Chip 
                          label={employeeInfo.role || 'Unknown'} 
                          variant="outlined"
                          sx={{ 
                            borderColor: '#667eea',
                            color: '#667eea',
                            fontWeight: 'bold',
                            textTransform: 'capitalize'
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Full Name"
                      value={`${employeeInfo.first_name} ${employeeInfo.last_name}`.trim() || 'Unknown'}
                      disabled
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f8fafc',
                          '& fieldset': { borderColor: '#e2e8f0' }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Date & Time Section */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <ScheduleIcon sx={{ color: '#667eea', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                    Date & Time
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, borderColor: '#667eea', borderWidth: 1 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.date}
                      helperText={errors.date}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#667eea', borderWidth: 2 },
                          '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        label="Time In"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => handleInputChange('start_time', e.target.value)}
                        required
                        fullWidth
                        error={!!errors.start_time}
                        helperText={errors.start_time}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: '#48bb78', borderWidth: 2 },
                            '&.Mui-focused fieldset': { borderColor: '#48bb78', borderWidth: 2 }
                          }
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => setCurrentTime('start_time')}
                        sx={{ 
                          position: 'absolute', 
                          right: 8, 
                          top: 8,
                          minWidth: 'auto',
                          p: 0.5,
                          color: '#48bb78'
                        }}
                      >
                        <AccessTimeIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        label="Time Out"
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => handleInputChange('end_time', e.target.value)}
                        required
                        fullWidth
                        error={!!errors.end_time}
                        helperText={errors.end_time}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: '#ed8936', borderWidth: 2 },
                            '&.Mui-focused fieldset': { borderColor: '#ed8936', borderWidth: 2 }
                          }
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => setCurrentTime('end_time')}
                        sx={{ 
                          position: 'absolute', 
                          right: 8, 
                          top: 8,
                          minWidth: 'auto',
                          p: 0.5,
                          color: '#ed8936'
                        }}
                      >
                        <AccessTimeIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Break Time Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: '#2d3748',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  🍽️ Break Time (Optional)
                </Typography>
                <Divider sx={{ mb: 3, borderColor: '#f59e0b', borderWidth: 1 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        label="Break Start"
                        type="time"
                        value={formData.break_start}
                        onChange={(e) => handleInputChange('break_start', e.target.value)}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: '#f59e0b', borderWidth: 2 },
                            '&.Mui-focused fieldset': { borderColor: '#f59e0b', borderWidth: 2 }
                          }
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => setCurrentTime('break_start')}
                        sx={{ 
                          position: 'absolute', 
                          right: 8, 
                          top: 8,
                          minWidth: 'auto',
                          p: 0.5,
                          color: '#f59e0b'
                        }}
                      >
                        <AccessTimeIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        label="Break End"
                        type="time"
                        value={formData.break_end}
                        onChange={(e) => handleInputChange('break_end', e.target.value)}
                        fullWidth
                        error={!!errors.break_end}
                        helperText={errors.break_end}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: '#f59e0b', borderWidth: 2 },
                            '&.Mui-focused fieldset': { borderColor: '#f59e0b', borderWidth: 2 }
                          }
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => setCurrentTime('break_end')}
                        sx={{ 
                          position: 'absolute', 
                          right: 8, 
                          top: 8,
                          minWidth: 'auto',
                          p: 0.5,
                          color: '#f59e0b'
                        }}
                      >
                        <AccessTimeIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Work Completed Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2, 
                  color: '#2d3748',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  💼 Work Completed
                </Typography>
                <Divider sx={{ mb: 3, borderColor: '#805ad5', borderWidth: 1 }} />
                
                <TextField
                  label="What did you work on today?"
                  value={formData.work_done}
                  onChange={(e) => handleInputChange('work_done', e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                  required
                  error={!!errors.work_done}
                  helperText={errors.work_done}
                  placeholder="Describe the tasks you completed, challenges faced, achievements, etc..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#805ad5', borderWidth: 2 },
                      '&.Mui-focused fieldset': { borderColor: '#805ad5', borderWidth: 2 }
                    }
                  }}
                />
              </Box>

              {/* Time Summary */}
              {formData.start_time && formData.end_time && (
                <Box sx={{ 
                  mb: 4, 
                  p: 3, 
                  bgcolor: '#f8fafc', 
                  borderRadius: 2,
                  border: '2px solid #e2e8f0'
                }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#2d3748' }}>
                    📊 Time Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Total Hours</Typography>
                      <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                        {calculateTotalHours().toFixed(2)} hours
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Break Duration</Typography>
                      <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                        {calculateBreakDuration()} minutes
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Submit Button */}
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
                    py: 1.5
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !employeeInfo.employee_id}
                  startIcon={<SaveIcon />}
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
                  {loading ? 'Creating...' : 'Create Timesheet'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </Dialog>
  );
};

export default CreateTimeSheet;