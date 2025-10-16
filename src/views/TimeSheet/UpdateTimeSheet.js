import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Alert,
    CircularProgress,
    Typography,
    Box
} from '@mui/material';

const UpdateTimeSheet = ({ open, timesheet, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        date: '',
        start_time: '',
        end_time: '',
        break_duration: 0,
        work_done: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    // Populate form when timesheet prop changes
    useEffect(() => {
        if (timesheet) {
            setFormData({
                date: timesheet.date || '',
                start_time: timesheet.start_time || '',
                end_time: timesheet.end_time || '',
                break_duration: timesheet.break_duration || 0,
                work_done: timesheet.work_done || ''
            });
        }
    }, [timesheet]);

    // Calculate hours
    const calculateHours = () => {
        const { start_time, end_time, break_duration } = formData;
        
        if (!start_time || !end_time) return { regular: 0, overtime: 0 };

        const timeIn = new Date(`2000-01-01T${start_time}`);
        const timeOut = new Date(`2000-01-01T${end_time}`);
        
        // break_duration is already in minutes from backend
        const breakDurationHours = break_duration / 60; // convert minutes to hours

        const totalHours = (timeOut - timeIn) / (1000 * 60 * 60) - breakDurationHours;
        const regularHours = Math.min(totalHours, 8);
        const overtimeHours = Math.max(totalHours - 8, 0);

        return { regular: regularHours, overtime: overtimeHours };
    };

    const { regular, overtime } = calculateHours();

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.date) newErrors.date = 'Date is required';
        if (!formData.start_time) newErrors.start_time = 'Start time is required';
        if (!formData.end_time) newErrors.end_time = 'End time is required';
        
        if (formData.start_time && formData.end_time) {
            const timeIn = new Date(`2000-01-01T${formData.start_time}`);
            const timeOut = new Date(`2000-01-01T${formData.end_time}`);
            if (timeOut <= timeIn) {
                newErrors.end_time = 'End time must be after start time';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate() || !timesheet) return;

        setLoading(true);
        setError('');

        try {
            const submitData = {
                ...formData,
                total_hours: regular + overtime
            };

            const response = await fetch(`${API_URL}/api/timesheets/${timesheet.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(submitData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update timesheet');
            }

            onSuccess();
            handleClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Update Timesheet</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                error={!!errors.date}
                                helperText={errors.date}
                                InputLabelProps={{ shrink: true }}
                                margin="normal"
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Time In"
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => handleChange('start_time', e.target.value)}
                                error={!!errors.start_time}
                                helperText={errors.start_time}
                                InputLabelProps={{ shrink: true }}
                                margin="normal"
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Time Out"
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => handleChange('end_time', e.target.value)}
                                error={!!errors.end_time}
                                helperText={errors.end_time}
                                InputLabelProps={{ shrink: true }}
                                margin="normal"
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Break Duration (minutes)"
                                type="number"
                                value={formData.break_duration}
                                onChange={(e) => handleChange('break_duration', parseInt(e.target.value) || 0)}
                                InputLabelProps={{ shrink: true }}
                                margin="normal"
                                inputProps={{ min: 0, max: 480 }} // Max 8 hours break
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Notes"
                                multiline
                                rows={3}
                                value={formData.work_done}
                                onChange={(e) => handleChange('work_done', e.target.value)}
                                margin="normal"
                            />
                        </Grid>
                        
                        {/* Hours calculation display */}
                        <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>Calculated Hours:</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="body2">
                                            Total Hours: <strong>{(regular + overtime).toFixed(2)}</strong>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            Regular Hours: <strong>{regular.toFixed(2)}</strong>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2">
                                            Break Duration: <strong>{formData.break_duration || 0} minutes</strong>
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        {loading ? 'Updating...' : 'Update Timesheet'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UpdateTimeSheet;