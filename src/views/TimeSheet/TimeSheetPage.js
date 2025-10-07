import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    Typography,
    Button,
    Tab,
    Tabs,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Chip,
    IconButton,
    Tooltip,
    Paper,
    Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Visibility as ViewIcon,
    CheckCircle as ApproveIcon,
    Cancel as DeclineIcon,
    Archive as ArchiveIcon,
    Refresh as RefreshIcon,
    Schedule,
    AccessTime,
    Business,
    Assignment,
    CheckCircle,
    TrendingUp
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import PageContainer from '../../components/container/PageContainer';
import CreateTimeSheet from './CreateTimeSheet';
import UpdateTimeSheet from './UpdateTimeSheet';
import ViewTimeSheet from './ViewTimeSheet';
import ApproveDeclineTimesheet from './ApproveDeclineTimesheet';
import timesheetService from '../../services/timesheetService';

const TimeSheetPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    // Dummy data for testing
    const [timesheets, setTimesheets] = useState([
        {
            id: 1,
            date: '2025-10-04',
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@basadi.com',
            time_in: '08:00',
            time_out: '17:00',
            break_start: '12:00',
            break_end: '13:00',
            total_hours: 8.0,
            regular_hours: 8.0,
            overtime_hours: 0.0,
            status: 'approved',
            work_done: 'Completed database optimization and fixed 3 critical bugs in the payment system. Attended team standup meeting.',
            created_at: '2025-10-04T08:00:00Z',
            updated_at: '2025-10-04T17:30:00Z',
            submitted_at: '2025-10-04T17:15:00Z',
            reviewed_at: '2025-10-04T18:00:00Z'
        },
        {
            id: 2,
            date: '2025-10-03',
            employee_id: 'EMP002',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@basadi.com',
            time_in: '09:00',
            time_out: '18:30',
            break_start: '12:30',
            break_end: '13:30',
            total_hours: 8.5,
            regular_hours: 8.0,
            overtime_hours: 0.5,
            status: 'submitted',
            work_done: 'Designed new user interface components for the project dashboard. Created wireframes and mockups for client review.',
            created_at: '2025-10-03T09:00:00Z',
            updated_at: '2025-10-03T18:45:00Z',
            submitted_at: '2025-10-03T18:40:00Z'
        },
        {
            id: 3,
            date: '2025-10-02',
            employee_id: 'EMP003',
            first_name: 'Mike',
            last_name: 'Johnson',
            email: 'mike.johnson@basadi.com',
            time_in: '08:30',
            time_out: '16:30',
            break_start: '12:00',
            break_end: '12:30',
            total_hours: 7.5,
            regular_hours: 7.5,
            overtime_hours: 0.0,
            status: 'draft',
            work_done: 'Working on API documentation and testing new endpoints. Still in progress.',
            created_at: '2025-10-02T08:30:00Z',
            updated_at: '2025-10-02T16:35:00Z'
        },
        {
            id: 4,
            date: '2025-10-01',
            employee_id: 'EMP004',
            first_name: 'Sarah',
            last_name: 'Wilson',
            email: 'sarah.wilson@basadi.com',
            time_in: '07:45',
            time_out: '19:00',
            break_start: '12:15',
            break_end: '13:00',
            total_hours: 10.5,
            regular_hours: 8.0,
            overtime_hours: 2.5,
            status: 'declined',
            work_done: 'Emergency server maintenance and system updates. Extended hours due to critical issues.',
            admin_notes: 'Overtime not pre-approved. Please get approval before working extended hours.',
            created_at: '2025-10-01T07:45:00Z',
            updated_at: '2025-10-01T19:15:00Z',
            submitted_at: '2025-10-01T19:10:00Z',
            reviewed_at: '2025-10-02T09:00:00Z'
        },
        {
            id: 5,
            date: '2025-09-30',
            employee_id: 'EMP005',
            first_name: 'David',
            last_name: 'Brown',
            email: 'david.brown@basadi.com',
            time_in: '08:15',
            time_out: '17:15',
            break_start: '13:00',
            break_end: '14:00',
            total_hours: 8.0,
            regular_hours: 8.0,
            overtime_hours: 0.0,
            status: 'archived',
            work_done: 'Code review sessions and mentoring junior developers. Updated coding standards documentation.',
            created_at: '2025-09-30T08:15:00Z',
            updated_at: '2025-09-30T17:30:00Z',
            submitted_at: '2025-09-30T17:20:00Z',
            reviewed_at: '2025-10-01T08:00:00Z'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDialog, setOpenDialog] = useState('');
    const [selectedTimesheet, setSelectedTimesheet] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: '',
        employeeId: ''
    });
    const [stats, setStats] = useState({
        total_timesheets: 45,
        submitted_count: 8,
        approved_count: 32,
        declined_count: 3,
        archived_count: 2,
        total_regular_hours: 320.5,
        total_overtime_hours: 28.5,
        draft_count: 5
    });

    // Get user info from localStorage or context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'super_admin' || user.role === 'admin';

    // API base URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Fetch timesheets (disabled for dummy data)
    const fetchTimesheets = async () => {
        setLoading(true);
        setError('');
        
        try {
            const filterParams = {};
            if (filters.status) filterParams.status = filters.status;
            if (filters.startDate) filterParams.date_from = filters.startDate;
            if (filters.endDate) filterParams.date_to = filters.endDate;
            if (filters.employeeId && isAdmin) filterParams.employee_id = filters.employeeId;

            const response = await timesheetService.getTimesheets(filterParams);
            setTimesheets(response.timesheets || []);
        } catch (err) {
            console.error('Error fetching timesheets:', err);
            setError('Failed to fetch timesheets: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics (disabled for dummy data)
    const fetchStats = async () => {
        // Temporarily disabled to show dummy data
        console.log('Using dummy stats data instead of API call');
        return;
        
        /* Original API call - commented out for dummy data testing
        if (!isAdmin) return;
        
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('start_date', filters.startDate);
            if (filters.endDate) params.append('end_date', filters.endDate);
            if (filters.employeeId) params.append('employee_id', filters.employeeId);

            const response = await fetch(`${API_URL}/api/timesheets/stats/summary?${params}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
        */
    };

    useEffect(() => {
        fetchTimesheets();
        if (isAdmin) {
            fetchStats();
        }
    }, [filters]);

    // Handle status change
    const handleStatusChange = async (timesheetId, action, notes = '') => {
        try {
            const response = await fetch(`${API_URL}/api/timesheets/${timesheetId}/review`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ action, admin_notes: notes })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setSuccess(`Timesheet ${action} successfully`);
            fetchTimesheets();
            if (isAdmin) fetchStats();
        } catch (err) {
            setError('Failed to update timesheet: ' + err.message);
        }
    };

    // Handle timesheet submission
    const handleSubmit = async (timesheetId) => {
        try {
            setLoading(true);
            const response = await timesheetService.submitTimesheet(timesheetId);
            setSuccess('Timesheet submitted for approval successfully!');
            fetchTimesheets(); // Refresh the list
        } catch (err) {
            console.error('Error submitting timesheet:', err);
            setError('Failed to submit timesheet: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle archive
    const handleArchive = async (timesheetId) => {
        try {
            const response = await fetch(`${API_URL}/api/timesheets/${timesheetId}/archive`, {
                method: 'PATCH',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setSuccess('Timesheet archived successfully');
            fetchTimesheets();
            if (isAdmin) fetchStats();
        } catch (err) {
            setError('Failed to archive timesheet: ' + err.message);
        }
    };

    // Status chip color mapping
    const getStatusChip = (status) => {
        const statusConfig = {
            draft: { color: '#9e9e9e', label: 'Draft', bgcolor: '#f5f5f5', textColor: '#616161' },
            submitted: { color: '#ff9800', label: 'Submitted', bgcolor: '#fff3e0', textColor: '#e65100' },
            approved: { color: '#4caf50', label: 'Approved', bgcolor: '#e8f5e8', textColor: '#2e7d32' },
            declined: { color: '#f44336', label: 'Declined', bgcolor: '#ffebee', textColor: '#c62828' },
            archived: { color: '#607d8b', label: 'Archived', bgcolor: '#eceff1', textColor: '#455a64' }
        };

        const config = statusConfig[status] || { color: '#9e9e9e', label: status, bgcolor: '#f5f5f5', textColor: '#616161' };
        return (
            <Chip 
                label={config.label} 
                size="small" 
                sx={{
                    backgroundColor: config.bgcolor,
                    color: config.textColor,
                    border: `1px solid ${config.color}`,
                    fontWeight: 'bold'
                }}
            />
        );
    };

    // DataGrid columns
    const columns = [
        { field: 'date', headerName: 'Date', width: 120, headerAlign: 'center', align: 'center' },
        { 
            field: 'employee_id', 
            headerName: 'Employee ID', 
            width: 120,
            headerAlign: 'center',
            align: 'center'
        },
        { field: 'time_in', headerName: 'Time In', width: 100, headerAlign: 'center', align: 'center' },
        { field: 'time_out', headerName: 'Time Out', width: 100, headerAlign: 'center', align: 'center' },
        { 
            field: 'break_start', 
            headerName: 'Break Start', 
            width: 110, 
            headerAlign: 'center', 
            align: 'center',
            valueFormatter: (params) => params.value || '--'
        },
        { 
            field: 'break_end', 
            headerName: 'Break End', 
            width: 110, 
            headerAlign: 'center', 
            align: 'center',
            valueFormatter: (params) => params.value || '--'
        },
        { 
            field: 'total_hours', 
            headerName: 'Total Hours', 
            width: 120, 
            headerAlign: 'center', 
            align: 'center',
            valueFormatter: (params) => parseFloat(params.value || 0).toFixed(2)
        },
        { 
            field: 'status', 
            headerName: 'Status', 
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => getStatusChip(params.value)
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            sortable: false,
            renderCell: (params) => {
                const timesheet = params.row;
                const canEdit = isAdmin || ['draft', 'declined'].includes(timesheet.status);
                const canSubmit = !isAdmin && ['draft', 'declined'].includes(timesheet.status);
                const canReview = isAdmin && timesheet.status === 'submitted';
                const canArchive = isAdmin && ['approved', 'declined'].includes(timesheet.status);

                return (
                    <Box>
                        <Tooltip title="View">
                            <IconButton size="small" onClick={() => {
                                setSelectedTimesheet(timesheet);
                                setOpenDialog('view');
                            }}>
                                <ViewIcon />
                            </IconButton>
                        </Tooltip>
                        
                        {canEdit && (
                            <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => {
                                    setSelectedTimesheet(timesheet);
                                    setOpenDialog('edit');
                                }}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        )}

                        {canSubmit && (
                            <Tooltip title="Submit">
                                <IconButton size="small" color="primary" onClick={() => {
                                    handleSubmit(timesheet.id);
                                }}>
                                    <CheckCircle />
                                </IconButton>
                            </Tooltip>
                        )}

                        {canReview && (
                            <Tooltip title="Review">
                                <IconButton size="small" color="warning" onClick={() => {
                                    setSelectedTimesheet(timesheet);
                                    setOpenDialog('review');
                                }}>
                                    <ApproveIcon />
                                </IconButton>
                            </Tooltip>
                        )}

                        {canArchive && (
                            <Tooltip title="Archive">
                                <IconButton size="small" onClick={() => {
                                    handleArchive(timesheet.id);
                                }}>
                                    <ArchiveIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                );
            }
        }
    ];

    return (
        <PageContainer title="Timesheets" description="Manage employee timesheets">
            <Box>
                {/* Enhanced Header */}
                <Paper sx={{ 
                    p: 4, 
                    mb: 3, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ 
                                bgcolor: 'rgba(255,255,255,0.2)', 
                                width: 56, 
                                height: 56,
                                backdropFilter: 'blur(10px)'
                            }}>
                                <Schedule sx={{ fontSize: 32, color: 'white' }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h3" sx={{ 
                                    fontWeight: 'bold',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                    mb: 1
                                }}>
                                    Timesheets
                                </Typography>
                                <Typography variant="h6" sx={{ 
                                    opacity: 0.9,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Business sx={{ fontSize: 20 }} />
                                    Track and manage employee working hours
                                </Typography>
                            </Box>
                        </Box>
                        <Box display="flex" gap={2}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={() => {
                                    fetchTimesheets();
                                    if (isAdmin) fetchStats();
                                }}
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.5)',
                                    '&:hover': {
                                        borderColor: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                Refresh
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenDialog('create')}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.3)'
                                    }
                                }}
                            >
                                New Timesheet
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                {/* Enhanced Statistics (Admin only) */}
                {isAdmin && stats && (
                    <Grid container spacing={3} mb={3}>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                <AccessTime sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.total_timesheets}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Timesheets</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                <Assignment sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.submitted_count}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>Pending Review</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                <CheckCircle sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.approved_count}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>Approved</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                <Schedule sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {parseFloat(stats.total_regular_hours || 0).toFixed(0)}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>Regular Hours</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }}>
                                <TrendingUp sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {parseFloat(stats.total_overtime_hours || 0).toFixed(0)}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>Overtime Hours</Typography>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Filters */}
                <Card sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    label="Status"
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="draft">Draft</MenuItem>
                                    <MenuItem value="submitted">Submitted</MenuItem>
                                    <MenuItem value="approved">Approved</MenuItem>
                                    <MenuItem value="declined">Declined</MenuItem>
                                    <MenuItem value="archived">Archived</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="Start Date"
                                InputLabelProps={{ shrink: true }}
                                value={filters.startDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                size="small"
                                type="date"
                                label="End Date"
                                InputLabelProps={{ shrink: true }}
                                value={filters.endDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </Grid>
                        {isAdmin && (
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Employee ID"
                                    value={filters.employeeId}
                                    onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                                />
                            </Grid>
                        )}
                        <Grid item>
                            <Button
                                variant="outlined"
                                onClick={() => setFilters({ status: '', startDate: '', endDate: '', employeeId: '' })}
                            >
                                Clear Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Card>

                {/* Messages */}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {/* Enhanced Data Grid */}
                <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                    <Box height={600}>
                        <DataGrid
                            rows={timesheets}
                            columns={columns}
                            pageSize={25}
                            rowsPerPageOptions={[10, 25, 50]}
                            loading={loading}
                            disableSelectionOnClick
                            autoHeight
                            sx={{
                                '& .MuiDataGrid-root': {
                                    border: 'none',
                                },
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid #f0f0f0',
                                    fontSize: '0.9rem',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f8f9fa',
                                    borderBottom: '2px solid #e0e0e0',
                                    fontSize: '0.95rem',
                                    fontWeight: 'bold',
                                    '& .MuiDataGrid-columnHeaderTitle': {
                                        fontWeight: 'bold',
                                        color: '#2d3748'
                                    }
                                },
                                '& .MuiDataGrid-row': {
                                    '&:hover': {
                                        backgroundColor: '#f8f9fa',
                                    }
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '2px solid #e0e0e0',
                                    backgroundColor: '#f8f9fa'
                                }
                            }}
                        />
                    </Box>
                </Card>

                {/* Dialogs */}
                <CreateTimeSheet
                    open={openDialog === 'create'}
                    onClose={() => setOpenDialog('')}
                    onSuccess={() => {
                        setOpenDialog('');
                        setSuccess('Timesheet created successfully');
                        fetchTimesheets();
                    }}
                />

                <UpdateTimeSheet
                    open={openDialog === 'edit'}
                    timesheet={selectedTimesheet}
                    onClose={() => setOpenDialog('')}
                    onSuccess={() => {
                        setOpenDialog('');
                        setSuccess('Timesheet updated successfully');
                        fetchTimesheets();
                    }}
                />

                <ViewTimeSheet
                    open={openDialog === 'view'}
                    timesheet={selectedTimesheet}
                    onClose={() => setOpenDialog('')}
                />

                <ApproveDeclineTimesheet
                    open={openDialog === 'review'}
                    timesheet={selectedTimesheet}
                    onClose={() => setOpenDialog('')}
                    onSuccess={(action) => {
                        setOpenDialog('');
                        setSuccess(`Timesheet ${action} successfully`);
                        fetchTimesheets();
                        if (isAdmin) fetchStats();
                    }}
                />
            </Box>
        </PageContainer>
    );
};

export default TimeSheetPage;
