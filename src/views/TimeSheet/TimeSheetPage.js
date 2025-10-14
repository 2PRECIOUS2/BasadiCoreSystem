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
import TimesheetPermissionGate from '../../components/shared/TimesheetPermissionGate';
import { 
    getCurrentUser, 
    canCreateTimesheet, 
    canViewAllTimesheets, 
    canApproveTimesheets, 
    canEditAllTimesheets,
    canEditTimesheet,
    isSuperAdmin 
} from '../../utils/rbac';
import { API_BASE_URL } from 'src/config';

const TimeSheetPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [timesheets, setTimesheets] = useState([]);
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
        total_timesheets: 0,
        submitted_count: 0,
        approved_count: 0,
        declined_count: 0,
        archived_count: 0,
        total_regular_hours: 0,
        total_overtime_hours: 0,
        draft_count: 0
    });

    // Get user permissions
    const currentUser = getCurrentUser();
    const canCreate = canCreateTimesheet();
    const canViewAll = canViewAllTimesheets();
    const canApprove = canApproveTimesheets();
    const canEditAll = canEditAllTimesheets();
    const canEditOwn = canEditTimesheet;
    const user = currentUser;
    const isUserSuperAdmin = isSuperAdmin();

    console.log('🔍 TimeSheet Permissions:', {
        canCreate,
        canViewAll,
        canApprove,
        canEditAll,
        canEditOwn,
        isUserSuperAdmin,
        userRole: user?.role,
        userId: user?.id,
        userEmployeeId: user?.employee_id || user?.employeeId
    });

    // API base URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Fetch timesheets from API
    const fetchTimesheets = async () => {
        setLoading(true);
        setError('');
        
        try {
            const filterParams = {};
            if (filters.status) filterParams.status = filters.status;
            if (filters.startDate) filterParams.date_from = filters.startDate;
            if (filters.endDate) filterParams.date_to = filters.endDate;
            
            // Only super admin can filter by employee_id (to see all timesheets)
            // Regular employees will only see their own timesheets (handled by backend)
            if (filters.employeeId && canViewAll) {
                filterParams.employee_id = filters.employeeId;
            }

            console.log('🔍 Fetching timesheets with filters:', filterParams);
            const response = await timesheetService.getTimesheets(filterParams);
            
            console.log('📦 Raw API response:', response);
            
            if (response.success) {
                // Map timesheet data to ensure each row has a unique 'id' and correct employee name
                const timesheetData = (response.data || response.timesheets || []).map(ts => ({
                    ...ts,
                    id: ts.id, // DataGrid requires 'id' field
                    employee_name: `${ts.first_name || ''} ${ts.last_name || ''}`.trim() || '--',
                }));
                setTimesheets(timesheetData);
                // Calculate stats from the timesheet data
                const calculatedStats = calculateStatsFromTimesheets(timesheetData);
                setStats(calculatedStats);
                console.log('✅ Fetched timesheets:', timesheetData.length);
            } else {
                throw new Error(response.message || 'Failed to fetch timesheets');
            }
        } catch (err) {
            console.error('❌ Error fetching timesheets:', err);
            setError('Failed to fetch timesheets: ' + err.message);
            setTimesheets([]);
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats from current timesheet data
    const calculateStatsFromTimesheets = (timesheetData) => {
        const stats = {
            total_timesheets: timesheetData.length,
            draft_count: 0,
            submitted_count: 0,
            approved_count: 0,
            declined_count: 0,
            archived_count: 0,
            total_regular_hours: 0
        };

        timesheetData.forEach(timesheet => {
            // Count by status
            switch (timesheet.status) {
                case 'draft':
                    stats.draft_count++;
                    break;
                case 'submitted':
                    stats.submitted_count++;
                    break;
                case 'approved':
                    stats.approved_count++;
                    break;
                case 'declined':
                case 'rejected':
                    stats.declined_count++;
                    break;
                case 'archived':
                    stats.archived_count++;
                    break;
            }

            // Sum total hours
            const hours = parseFloat(timesheet.total_hours || 0);
            stats.total_regular_hours += hours;
        });

        return stats;
    };

    // Fetch statistics
    const fetchStats = async () => {
        if (!canViewAll) return; // Only admins can see stats
        
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('start_date', filters.startDate);
            if (filters.endDate) params.append('end_date', filters.endDate);
            if (filters.employeeId) params.append('employee_id', filters.employeeId);

            console.log('🔍 Fetching stats with params:', params.toString());
            const response = await fetch(`${API_URL}/api/timesheets/stats/summary?${params}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setStats(data.stats || {});
                console.log('✅ Fetched stats:', data.stats);
            } else {
                console.warn('⚠️ Stats fetch returned no data');
                setStats({});
            }
        } catch (err) {
            console.error('❌ Failed to fetch stats:', err);
            setStats({});
        }
    };

    useEffect(() => {
        fetchTimesheets();
        // Stats are now calculated from timesheet data in fetchTimesheets()
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
            if (canViewAll) fetchStats();
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
            if (canViewAll) fetchStats();
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
        { field: 'employee_id', headerName: 'Employee ID', width: 120, headerAlign: 'center', align: 'center' },
        { field: 'start_time', headerName: 'Start Time', width: 120, headerAlign: 'center', align: 'center' },
        { field: 'end_time', headerName: 'End Time', width: 120, headerAlign: 'center', align: 'center' },
        { field: 'total_hours', headerName: 'Total Hours', width: 120, headerAlign: 'center', align: 'center' },
        { field: 'status', headerName: 'Status', width: 120, headerAlign: 'center', align: 'center' },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            sortable: false,
            renderCell: (params) => {
                if (!params || !params.row) return null;
                const timesheet = params.row;
                const canEdit = (canEditAll || (canEditOwn && timesheet.employee_id === user.employee_id)) && ['draft', 'declined'].includes(timesheet.status);
                const canSubmit = canCreate && ['draft', 'declined'].includes(timesheet.status) && timesheet.employee_id === user.employee_id;
                const canReview = canApprove && timesheet.status === 'submitted';
                const canArchive = canEditAll && ['approved', 'declined'].includes(timesheet.status);

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
                                    if (canViewAll) fetchStats();
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
                            <TimesheetPermissionGate permission="create">
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
                            </TimesheetPermissionGate>
                        </Box>
                    </Box>
                </Paper>

                {/* Enhanced Statistics */}
                {stats && (
                    <Grid container spacing={3} mb={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                height: '140px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}>
                                <AccessTime sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.total_timesheets || 0}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Timesheets</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                height: '140px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}>
                                <Assignment sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.draft_count || 0}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>Draft</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                height: '140px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}>
                                <Assignment sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.submitted_count || 0}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>Pending Review</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ 
                                p: 3, 
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                                color: 'white',
                                borderRadius: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                height: '140px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}>
                                <CheckCircle sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {stats.approved_count || 0}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>Approved</Typography>
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
                        <TimesheetPermissionGate permission="view_all">
                            <Grid item xs={12} sm={6} md={2}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Employee ID"
                                    value={filters.employeeId}
                                    onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                                />
                            </Grid>
                        </TimesheetPermissionGate>
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
                        if (canViewAll) fetchStats();
                    }}
                />
            </Box>
        </PageContainer>
    );
};

export default TimeSheetPage;
