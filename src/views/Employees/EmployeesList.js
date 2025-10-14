import React, { useState, useEffect } from "react";
import {
  Grid, Card, CardContent, Typography, Avatar, Box, IconButton, Menu, MenuItem, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, Snackbar,
  Chip, Paper, Tooltip, Zoom
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import axios from "axios";
import { API_BASE_URL } from 'src/config';

const avatarColors = [
  "#8e99f3", "#f48fb1", "#80cbc4", "#ffd54f",
  "#a1887f", "#90caf9", "#ce93d8", "#ffab91",
];

function stringAvatar(name, color) {
  return {
    sx: {
      bgcolor: color,
      width: 56,
      height: 56,
      fontSize: 22,
      fontWeight: 700,
    },
    children: name
      .split(" ")
      .map((n) => n[0])
      .join(""),
  };
}

const EmployeesList = ({ onView, onEdit, refreshTrigger }) => {
  const [employees, setEmployees] = useState([]);
  const [anchorEls, setAnchorEls] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // "archive" or "restore"
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [error, setError] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");


  // Fetch employees from backend
  const fetchEmployees = async () => {
  try {
    const res = await axios.get("/api/employees", { withCredentials: true });
    setEmployees(res.data);
  } catch (err) {
    setEmployees([]);
  }
};

useEffect(() => {
  fetchEmployees();
}, []);

// Refresh employees when refreshTrigger changes
useEffect(() => {
  if (refreshTrigger) {
    fetchEmployees();
  }
}, [refreshTrigger]);
  // Refresh employees when toggling archived/active or after archive/restore
  const handleToggleArchived = () => {
    setShowArchived((prev) => !prev);
    fetchEmployees();
  };

  const handleMenuOpen = (event, idx) => {
    setAnchorEls((prev) => ({ ...prev, [idx]: event.currentTarget }));
  };

  const handleMenuClose = (idx) => {
    setAnchorEls((prev) => ({ ...prev, [idx]: null }));
  };

  const handleArchiveClick = (emp) => {
    setSelectedEmp(emp);
    setActionType("archive");
    setError("");
    setConfirmOpen(true);
  };

  const handleRestoreClick = (emp) => {
    setSelectedEmp(emp);
    setActionType("restore");
    setError("");
    setConfirmOpen(true);
  };

  
const handleConfirm = async () => {
  if (!selectedEmp) return;
  try {
    if (actionType === "archive") {
      await axios.put(
        `/api/employees/${selectedEmp.employee_id}/archive`,
        {}, // body is empty
        { withCredentials: true }
      );
      setSnackbarMsg("Employee archived successfully");
    } else if (actionType === "restore") {
      await axios.put(
        `/api/employees/${selectedEmp.employee_id}/restore`,
        {},
        { withCredentials: true }
      );
      setSnackbarMsg("Employee restored successfully");
    }

    setSnackbarOpen(true);
    setConfirmOpen(false);
    fetchEmployees(); // Auto-refresh after action
  } catch (err) {
    setError(
      err.response?.data?.error ||
      "Failed to perform action."
    );
  }
};

  const filteredEmployees = employees.filter(emp =>
    showArchived ? emp.employment_status === "archived" : emp.employment_status !== "archived"
  );

  return (
    <>
      <Paper sx={{ 
        p: 3,
        mb: 3,
        borderRadius: 3,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <WorkIcon sx={{ color: '#667eea', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                {showArchived ? 'Archived Employees' : 'Active Team Members'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {showArchived ? 'Previously archived employees' : 'Current active workforce'}
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            onClick={handleToggleArchived}
            sx={{
              py: 1.5,
              px: 4,
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              background: showArchived 
                ? 'linear-gradient(45deg, #48bb78, #68d391)'
                : 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              boxShadow: showArchived
                ? '0 4px 16px rgba(72, 187, 120, 0.3)'
                : '0 4px 16px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: showArchived
                  ? 'linear-gradient(45deg, #38a169, #48bb78)'
                  : 'linear-gradient(45deg, #5a67d8, #667eea)',
                transform: 'translateY(-2px)',
                boxShadow: showArchived
                  ? '0 8px 25px rgba(72, 187, 120, 0.4)'
                  : '0 8px 25px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            {showArchived ? "Show Active Employees" : "Show Archived Employees"}
          </Button>
        </Box>
      </Paper>
      <Grid container spacing={3} sx={{ mt: 1, mb: 2 }}>
        {filteredEmployees.map((emp, idx) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={emp.employee_id || emp.id}
          >
            <Zoom in={true} timeout={300 + idx * 100}>
              <Card
                sx={{
                  borderRadius: 3,
                  minHeight: 380,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  p: 0,
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    '& .card-header': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }
                  }
                }}
              >
                {/* Enhanced Header with Gradient */}
                <Box 
                  className="card-header"
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    p: 2,
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Status Chip */}
                  <Chip
                    label={emp.employment_status === 'archived' ? 'Archived' : 'Active'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      bgcolor: emp.employment_status === 'archived' ? '#ff6b6b' : '#51cf66',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '10px'
                    }}
                  />
                  
                  {/* Ellipsis menu */}
                  <IconButton
                    aria-label="more"
                    onClick={(e) => handleMenuOpen(e, idx)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)'
                      }
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  
                  {/* Avatar centered */}
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: avatarColors[idx % avatarColors.length],
                        width: 70,
                        height: 70,
                        fontSize: 28,
                        fontWeight: 700,
                        border: '4px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                      }}
                    >
                      {emp.first_name?.[0]}{emp.last_name?.[0]}
                    </Avatar>
                  </Box>
                  
                  {/* Name and Role */}
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {emp.first_name} {emp.last_name}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: '500'
                    }}>
                      {emp.role}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Card Content with Beautiful Icons */}
                <CardContent sx={{ 
                  flexGrow: 1, 
                  width: "100%", 
                  p: 3,
                  background: 'rgba(255,255,255,0.95)'
                }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Hired Date */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CalendarIcon sx={{ color: '#667eea', fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold' }}>
                          Hired Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: '500' }}>
                          {emp.hired_date
                            ? new Date(emp.hired_date).toLocaleDateString()
                            : "Not specified"}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Email */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <EmailIcon sx={{ color: '#48bb78', fontSize: 20 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold' }}>
                          Email
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: '500',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {emp.email}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Phone */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PhoneIcon sx={{ color: '#ed8936', fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold' }}>
                          Phone
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: '500' }}>
                          {emp.cell_no}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Employment Type Chip */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      <Chip
                        label={emp.employment_type || 'Not specified'}
                        size="small"
                        sx={{
                          bgcolor: emp.employment_type === 'Permanent' ? '#e3f2fd' : '#fff3e0',
                          color: emp.employment_type === 'Permanent' ? '#1976d2' : '#f57c00',
                          fontWeight: 'bold',
                          border: emp.employment_type === 'Permanent' 
                            ? '1px solid #1976d2' 
                            : '1px solid #f57c00'
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
                
                {/* Enhanced Menu */}
                <Menu
                  anchorEl={anchorEls[idx]}
                  open={Boolean(anchorEls[idx])}
                  onClose={() => handleMenuClose(idx)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)'
                    }
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose(idx);
                      onView && onView(emp);
                    }}
                    sx={{
                      gap: 1.5,
                      py: 1.5,
                      px: 2,
                      '&:hover': {
                        bgcolor: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea'
                      }
                    }}
                  >
                    <VisibilityIcon sx={{ color: '#667eea', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: '500' }}>View Details</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose(idx);
                      onEdit && onEdit(emp);
                    }}
                    sx={{
                      gap: 1.5,
                      py: 1.5,
                      px: 2,
                      '&:hover': {
                        bgcolor: 'rgba(72, 187, 120, 0.1)',
                        color: '#48bb78'
                      }
                    }}
                  >
                    <EditIcon sx={{ color: '#48bb78', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: '500' }}>Update</Typography>
                  </MenuItem>
                  {emp.employment_status === "archived" ? (
                    <MenuItem
                      onClick={() => {
                        handleMenuClose(idx);
                        handleRestoreClick(emp);
                      }}
                      sx={{
                        gap: 1.5,
                        py: 1.5,
                        px: 2,
                        bgcolor: '#48bb78',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                          bgcolor: '#38a169'
                        }
                      }}
                    >
                      <RestoreIcon sx={{ color: 'white', fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 'bold' }}>Restore</Typography>
                    </MenuItem>
                  ) : (
                    <MenuItem
                      onClick={() => {
                        handleMenuClose(idx);
                        handleArchiveClick(emp);
                      }}
                      sx={{
                        gap: 1.5,
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          bgcolor: 'rgba(229, 57, 53, 0.1)',
                          color: '#e53935'
                        }
                      }}
                    >
                      <ArchiveIcon sx={{ color: '#e53935', fontSize: 20 }} />
                      <Typography sx={{ fontWeight: '500' }}>Archive</Typography>
                    </MenuItem>
                  )}
                </Menu>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          {actionType === "archive"
            ? "Archive Employee"
            : "Restore Employee"}
        </DialogTitle>
        <DialogContent>
          {actionType === "archive" ? (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Are you sure you want to archive this employee?
              </Alert>
              <ul>
                <li>You cannot archive an employee with active tasks.</li>
                <li>Archived employees can still be assigned new tasks.</li>
              </ul>
            </>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              Are you sure you want to restore this employee?
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            color={actionType === "archive" ? "error" : "success"}
            variant="contained"
            sx={actionType === "restore"
              ? { backgroundColor: "#43a047", color: "#fff", "&:hover": { backgroundColor: "#388e3c" } }
              : {}
            }
          >
            {actionType === "archive" ? "Archive" : "Restore"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMsg}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </>
  );
};

export default EmployeesList;