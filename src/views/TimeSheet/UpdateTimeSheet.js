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
        time_in: '',
        time_out: '',
        break_start: '',
        break_end: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Populate form when timesheet prop changes
    useEffect(() => {
        if (timesheet) {
            setFormData({
                date: timesheet.date || '',
                time_in: timesheet.time_in || '',
                time_out: timesheet.time_out || '',
                break_start: timesheet.break_start || '',
                break_end: timesheet.break_end || '',
                notes: timesheet.notes || ''
            });
        }
    }, [timesheet]);

    // Calculate hours
    const calculateHours = () => {
        const { time_in, time_out, break_start, break_end } = formData;
        
        if (!time_in || !time_out) return { regular: 0, overtime: 0 };

        const timeIn = new Date(`2000-01-01T${time_in}`);
        const timeOut = new Date(`2000-01-01T${time_out}`);
        let breakDuration = 0;

        if (break_start && break_end) {
            const breakStart = new Date(`2000-01-01T${break_start}`);
            const breakEnd = new Date(`2000-01-01T${break_end}`);
            breakDuration = (breakEnd - breakStart) / (1000 * 60 * 60); // hours
        }

        const totalHours = (timeOut - timeIn) / (1000 * 60 * 60) - breakDuration;
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
        if (!formData.time_in) newErrors.time_in = 'Time in is required';
        if (!formData.time_out) newErrors.time_out = 'Time out is required';
        
        if (formData.time_in && formData.time_out) {
            const timeIn = new Date(`2000-01-01T${formData.time_in}`);
            const timeOut = new Date(`2000-01-01T${formData.time_out}`);
            if (timeOut <= timeIn) {
                newErrors.time_out = 'Time out must be after time in';
            }
        }

        if (formData.break_start && formData.break_end) {
            const breakStart = new Date(`2000-01-01T${formData.break_start}`);
            const breakEnd = new Date(`2000-01-01T${formData.break_end}`);
            if (breakEnd <= breakStart) {
                newErrors.break_end = 'Break end must be after break start';
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
                                value={formData.time_in}
                                onChange={(e) => handleChange('time_in', e.target.value)}
                                error={!!errors.time_in}
                                helperText={errors.time_in}
                                InputLabelProps={{ shrink: true }}
                                margin="normal"
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Time Out"
                                type="time"
                                value={formData.time_out}
                                onChange={(e) => handleChange('time_out', e.target.value)}
                                error={!!errors.time_out}
                                helperText={errors.time_out}
                                InputLabelProps={{ shrink: true }}
                                margin="normal"
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Break Start"
                                type="time"
                                value={formData.break_start}
                                onChange={(e) => handleChange('break_start', e.target.value)}
                                error={!!errors.break_start}
                                helperText={errors.break_start}
                                InputLabelProps={{ shrink: true }}
                                margin="normal"
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Break End"
                                type="time"
                                value={formData.break_end}
                                onChange={(e) => handleChange('break_end', e.target.value)}
                                error={!!errors.break_end}
                                helperText={errors.break_end}
                                InputLabelProps={{ shrink: true }}
                                margin="normal"
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Notes"
                                multiline
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
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