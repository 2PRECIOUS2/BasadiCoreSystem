import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Grid,
    Box,
    Paper,
    Alert,
    CircularProgress,
    Chip
} from '@mui/material';
import { CheckCircle as ApproveIcon, Cancel as DeclineIcon } from '@mui/icons-material';

const ApproveDeclineTimesheet = ({ open, timesheet, onClose, onSuccess }) => {
    const [adminNotes, setAdminNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    if (!timesheet) return null;

    const handleAction = async (action) => {
        setLoading(true);
        setError('');

        try {
            const endpoint = action === 'approved' ? 'approve' : 'reject';
            const response = await fetch(`${API_URL}/api/timesheets/${timesheet.id}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    rejection_reason: action === 'rejected' ? adminNotes : undefined
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${action} timesheet`);
            }

            onSuccess(action);
            handleClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setAdminNotes('');
        setError('');
        onClose();
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'Not set';
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Review Timesheet</Typography>
                    <Chip label="Pending Review" color="primary" size="small" />
                </Box>
            </DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                {/* Timesheet Summary */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Timesheet Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Employee</Typography>
                            <Typography variant="body1">
                                {timesheet.first_name} {timesheet.last_name}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Department</Typography>
                            <Typography variant="body1">{timesheet.department || 'Not specified'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Date</Typography>
                            <Typography variant="body1">{formatDate(timesheet.date)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Submitted</Typography>
                            <Typography variant="body1">
                                {timesheet.submitted_at ? new Date(timesheet.submitted_at).toLocaleString() : 'Not submitted'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Time Details */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Time Details
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Start Time</Typography>
                            <Typography variant="body1">{formatTime(timesheet.start_time)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">End Time</Typography>
                            <Typography variant="body1">{formatTime(timesheet.end_time)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Break Duration</Typography>
                            <Typography variant="body1">{timesheet.break_duration || 0} minutes</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="textSecondary">Total Hours</Typography>
                            <Typography variant="body1">{timesheet.total_hours || 0} hours</Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Hours Summary */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Hours Summary
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Hours</Typography>
                            <Typography variant="h6">{parseFloat(timesheet.total_hours || 0).toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>Break Time</Typography>
                            <Typography variant="h6">{parseFloat(timesheet.break_duration || 0)} min</Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>Status</Typography>
                            <Typography variant="h6">{timesheet.status}</Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Employee Notes */}
                {timesheet.work_done && (
                    <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            Work Done
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {timesheet.work_done}
                        </Typography>
                    </Paper>
                )}

                {/* Admin Review Notes */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Admin Review Notes
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about your review decision (required for rejection)..."
                        variant="outlined"
                    />
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button 
                    onClick={() => handleAction('rejected')} 
                    disabled={loading}
                    color="error"
                    variant="outlined"
                    startIcon={loading ? <CircularProgress size={20} /> : <DeclineIcon />}
                >
                    {loading ? 'Processing...' : 'Decline'}
                </Button>
                <Button 
                    onClick={() => handleAction('approved')} 
                    disabled={loading}
                    color="success"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <ApproveIcon />}
                >
                    {loading ? 'Processing...' : 'Approve'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApproveDeclineTimesheet;