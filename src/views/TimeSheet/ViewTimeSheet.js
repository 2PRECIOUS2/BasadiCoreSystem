import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    Box,
    Chip,
    Paper,
    Divider
} from '@mui/material';
import {
    AccessTime as TimeIcon,
    DateRange as DateIcon,
    Person as PersonIcon,
    Work as WorkIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';

const ViewTimeSheet = ({ open, timesheet, onClose }) => {
    if (!timesheet) return null;

    const getStatusChip = (status) => {
        const statusConfig = {
            draft: { color: 'default', label: 'Draft', icon: '📝' },
            submitted: { color: 'primary', label: 'Submitted', icon: '📤' },
            approved: { color: 'success', label: 'Approved', icon: '✅' },
            rejected: { color: 'error', label: 'Rejected', icon: '❌' },
            declined: { color: 'error', label: 'Declined', icon: '❌' },
            archived: { color: 'secondary', label: 'Archived', icon: '📁' }
        };

        const config = statusConfig[status] || { color: 'default', label: status, icon: '❓' };
        return (
            <Chip 
                label={`${config.icon} ${config.label}`} 
                color={config.color} 
                size="medium"
                sx={{ fontWeight: 'bold' }}
            />
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'Not set';
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDateTime = (datetimeString) => {
        if (!datetimeString) return 'Not set';
        return new Date(datetimeString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatBreakDuration = (breakMinutes) => {
        if (!breakMinutes || breakMinutes === 0) return 'No break';
        const hours = Math.floor(breakMinutes / 60);
        const minutes = breakMinutes % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes} minutes`;
    };

    const calculateWorkingHours = () => {
        if (!timesheet.start_time || !timesheet.end_time) return 'N/A';
        
        const start = new Date(`2000-01-01T${timesheet.start_time}`);
        const end = new Date(`2000-01-01T${timesheet.end_time}`);
        const totalMinutes = (end - start) / (1000 * 60);
        const breakMinutes = timesheet.break_duration || 0;
        const workingMinutes = totalMinutes - breakMinutes;
        
        const hours = Math.floor(workingMinutes / 60);
        const minutes = workingMinutes % 60;
        
        return `${hours}h ${minutes}m`;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <ScheduleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                Timesheet Details
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                {formatDate(timesheet.date)}
                            </Typography>
                        </Box>
                    </Box>
                    {getStatusChip(timesheet.status)}
                </Box>
                <Divider />
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={3}>
                    {/* Employee Information */}
                    <Grid item xs={12}>
                        <Paper sx={{ 
                            p: 3, 
                            bgcolor: 'background.default',
                            border: '2px solid',
                            borderColor: 'primary.light',
                            borderRadius: 3
                        }}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <PersonIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Employee Information
                                </Typography>
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Full Name
                                    </Typography>
                                    <Typography variant="h6" fontWeight="500">
                                        {timesheet.first_name} {timesheet.last_name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Employee ID
                                    </Typography>
                                    <Typography variant="h6" fontWeight="500">
                                        #{timesheet.employee_id}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Email Address
                                    </Typography>
                                    <Typography variant="body1">
                                        {timesheet.email}
                                    </Typography>
                                </Grid>
                                
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Time Information */}
                    <Grid item xs={12}>
                        <Paper sx={{ 
                            p: 3, 
                            bgcolor: 'background.default',
                            border: '2px solid',
                            borderColor: 'success.light',
                            borderRadius: 3
                        }}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <TimeIcon sx={{ fontSize: 28, color: 'success.main' }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Time Information
                                </Typography>
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        📅 Date
                                    </Typography>
                                    <Typography variant="h6" fontWeight="500">
                                        {formatDate(timesheet.date)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        🕘 Start Time
                                    </Typography>
                                    <Typography variant="h6" fontWeight="500" color="success.main">
                                        {formatTime(timesheet.start_time)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        🕔 End Time
                                    </Typography>
                                    <Typography variant="h6" fontWeight="500" color="warning.main">
                                        {formatTime(timesheet.end_time)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        ☕ Break Duration
                                    </Typography>
                                    <Typography variant="h6" fontWeight="500">
                                        {formatBreakDuration(timesheet.break_duration)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Hours Summary */}
                    <Grid item xs={12}>
                        <Paper sx={{ 
                            p: 3, 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: 3
                        }}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <ScheduleIcon sx={{ fontSize: 28, color: 'white' }} />
                                <Typography variant="h6" fontWeight="bold" color="white">
                                    Hours Summary
                                </Typography>
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                                        Total Hours (Database)
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {parseFloat(timesheet.total_hours || 0).toFixed(2)}h
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                                        Working Hours (Calculated)
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {calculateWorkingHours()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                                        Break Time
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {formatBreakDuration(timesheet.break_duration)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Work Description */}
                    <Grid item xs={12}>
                        <Paper sx={{ 
                            p: 3, 
                            bgcolor: 'background.default',
                            border: '2px solid',
                            borderColor: 'info.light',
                            borderRadius: 3
                        }}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <WorkIcon sx={{ fontSize: 28, color: 'info.main' }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Work Description
                                </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ 
                                whiteSpace: 'pre-wrap',
                                bgcolor: 'grey.50',
                                p: 2,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'grey.200'
                            }}>
                                {timesheet.work_done || 'No description provided'}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Approval Information */}
                    {(timesheet.approved_at || timesheet.rejection_reason) && (
                        <Grid item xs={12}>
                            <Paper sx={{ 
                                p: 3, 
                                bgcolor: timesheet.status === 'approved' ? 'success.light' : 'error.light',
                                borderRadius: 3
                            }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Approval Information
                                </Typography>
                                <Grid container spacing={2}>
                                    {timesheet.approver_first_name && (
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Reviewed By
                                            </Typography>
                                            <Typography variant="body1" fontWeight="500">
                                                {timesheet.approver_first_name} {timesheet.approver_last_name}
                                            </Typography>
                                        </Grid>
                                    )}
                                    {timesheet.approved_at && (
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Approved At
                                            </Typography>
                                            <Typography variant="body1" fontWeight="500">
                                                {formatDateTime(timesheet.approved_at)}
                                            </Typography>
                                        </Grid>
                                    )}
                                    {timesheet.rejection_reason && (
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.secondary">
                                                Rejection Reason
                                            </Typography>
                                            <Typography variant="body1" sx={{ 
                                                whiteSpace: 'pre-wrap',
                                                bgcolor: 'rgba(255,255,255,0.7)',
                                                p: 2,
                                                borderRadius: 1,
                                                mt: 1
                                            }}>
                                                {timesheet.rejection_reason}
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Paper>
                        </Grid>
                    )}

                    {/* Timeline */}
                    <Grid item xs={12}>
                        <Paper sx={{ 
                            p: 3, 
                            bgcolor: 'background.default',
                            border: '2px solid',
                            borderColor: 'grey.300',
                            borderRadius: 3
                        }}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <DateIcon sx={{ fontSize: 28, color: 'grey.600' }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Timeline
                                </Typography>
                            </Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Created
                                    </Typography>
                                    <Typography variant="body1" fontWeight="500">
                                        {formatDateTime(timesheet.created_at)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Last Updated
                                    </Typography>
                                    <Typography variant="body1" fontWeight="500">
                                        {formatDateTime(timesheet.updated_at)}
                                    </Typography>
                                </Grid>
                                {timesheet.submitted_at && (
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Submitted
                                        </Typography>
                                        <Typography variant="body1" fontWeight="500" color="primary.main">
                                            {formatDateTime(timesheet.submitted_at)}
                                        </Typography>
                                    </Grid>
                                )}
                                {timesheet.approved_at && (
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Approved
                                        </Typography>
                                        <Typography variant="body1" fontWeight="500" color="success.main">
                                            {formatDateTime(timesheet.approved_at)}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Button 
                    onClick={onClose} 
                    variant="contained" 
                    size="large"
                    sx={{ 
                        px: 4,
                        py: 1.5,
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                        }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ViewTimeSheet;