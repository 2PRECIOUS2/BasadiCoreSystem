import React, { useState, useEffect } from "react";
import {
  Grid, Card, CardContent, Typography, Avatar, Box, IconButton, Menu, MenuItem, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, Snackbar
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import RestoreIcon from "@mui/icons-material/Restore";
import axios from "axios";

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

const EmployeesList = ({ onView, onEdit }) => {
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
      const res = await axios.get("/api/employees");
      setEmployees(res.data);
    } catch (err) {
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

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
        await axios.put(`/api/employees/${selectedEmp.employee_id}/archive`);
        setSnackbarMsg("Employee archived successfully");
      } else if (actionType === "restore") {
        await axios.put(`/api/employees/${selectedEmp.employee_id}/restore`);
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
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleToggleArchived}
          sx={{
            borderRadius: 5,
            fontWeight: 600,
            px: 3,
            backgroundColor: showArchived ? "#1976d2" : "#1976d2",
            color: "#fff",
            "&:hover": { backgroundColor: "#1565c0" }
          }}
        >
          {showArchived ? "SHOW ACTIVE EMPLOYEES" : "SHOW ARCHIVED EMPLOYEES"}
        </Button>
      </Box>
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
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 2,
                minHeight: 340,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                p: 2,
                position: "relative",
                gap: 1,
              }}
            >
              {/* Ellipsis menu */}
              <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                <IconButton
                  aria-label="more"
                  onClick={(e) => handleMenuOpen(e, idx)}
                  size="small"
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEls[idx]}
                  open={Boolean(anchorEls[idx])}
                  onClose={() => handleMenuClose(idx)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose(idx);
                      onView && onView(emp);
                    }}
                  >
                    <VisibilityIcon sx={{ color: "#1976d2", mr: 1 }} />
                    View Details
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose(idx);
                      onEdit && onEdit(emp);
                    }}
                  >
                    <EditIcon sx={{ color: "#43a047", mr: 1 }} />
                    Update
                  </MenuItem>
                  {emp.employment_status === "archived" ? (
                    <MenuItem
                      onClick={() => {
                        handleMenuClose(idx);
                        handleRestoreClick(emp);
                      }}
                      sx={{
                        color: "#fff",
                        fontWeight: 600,
                        backgroundColor: "#43a047",
                        "&:hover": { backgroundColor: "#388e3c", color: "#fff" }
                      }}
                    >
                      <RestoreIcon sx={{ color: "#fff", mr: 1 }} />
                      Restore
                    </MenuItem>
                  ) : (
                    <MenuItem
                      onClick={() => {
                        handleMenuClose(idx);
                        handleArchiveClick(emp);
                      }}
                      sx={{
                        color: "#e53935",
                        fontWeight: 600,
                        backgroundColor: "transparent",
                        "&:hover": { backgroundColor: "#ffcdd2", color: "#e53935" }
                      }}
                    >
                      <ArchiveIcon sx={{ color: "#e53935", mr: 1 }} />
                      Archive
                    </MenuItem>
                  )}
                </Menu>
              </Box>
              {/* Avatar */}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 1 }}>
                <Avatar
                  {...stringAvatar(
                    `${emp.first_name} ${emp.last_name}`,
                    avatarColors[idx % avatarColors.length]
                  )}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1, width: "100%", textAlign: "center", p: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {emp.first_name} {emp.last_name}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  {emp.role}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <b>Hired Date:</b>{" "}
                    {emp.hired_date
                      ? new Date(emp.hired_date).toISOString().slice(0, 10)
                      : ""}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <b>Email:</b> {emp.email}
                  </Typography>
                  <Typography variant="body2">
                    <b>Cell:</b> {emp.cell_no}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
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