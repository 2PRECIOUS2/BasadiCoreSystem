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
  Grid,
  Card,
  Slide,
  CardContent,
  Checkbox,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import LinearProgress from "@mui/material/LinearProgress";
import { API_BASE_URL } from 'src/config';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function UpdateProject({ open, onClose, project, onSave }) {
  // Format date to yyyy-MM-dd for input fields
  const formatDate = (dateVal) => {
    if (!dateVal) return "";
    const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  };
  
  // Helper to get field from either camelCase or snake_case
  const getField = (obj, camel, snake) => obj[camel] !== undefined ? obj[camel] : obj[snake] || "";
  
  // Normalize tasks from backend to frontend format
  const normalizeTasks = (tasksArr) => {
    if (!Array.isArray(tasksArr)) return [];
    return tasksArr.map(t => ({
      id: t.id || t.task_id,
      name: t.name || t.task || "",
      assignedStaff: t.assignedStaff || (t.staffId ? [t.staffId] : []),
      staffInitials: t.staffInitials || (t.firstName && t.lastName 
        ? `${t.firstName[0]}${t.lastName[0]}`.toUpperCase() 
        : (t.first_name && t.last_name 
          ? `${t.first_name[0]}${t.last_name[0]}`.toUpperCase() 
          : "")),
      deadline: t.deadline || t.taskDeadline || "",
      completed: t.completed || false
    }));
  };

  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [partner, setPartner] = useState("");
  const [notes, setNotes] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [taskStaff, setTaskStaff] = useState([]);
  const [taskDeadline, setTaskDeadline] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});
  const [showAddTask, setShowAddTask] = useState(false);


  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects/employees`)
    .then(res => res.json())
    .then(data => setStaffList(data))
    .catch(() => setStaffList([]));
  }, []);

  useEffect(() => {
    // Always fetch the latest project details (with tasks) from backend
    if (project && project.id) {
      fetch(`${API_BASE_URL}/api/projects/${project.id}`)
      .then(res => res.json())
      .then(data => {
          setStartDate(formatDate(getField(data, "startDate", "start_date")));
          setDeadline(formatDate(getField(data, "deadline", "deadline")));
          setLocation(getField(data, "location", "location"));
          setPartner(getField(data, "partner", "partner"));
          setNotes(getField(data, "notes", "additional_notes"));
          setTasks(normalizeTasks(data.tasks || []));
        })
        .catch(() => {
          // fallback to prop if fetch fails
          setStartDate(formatDate(getField(project, "startDate", "start_date")));
          setDeadline(formatDate(getField(project, "deadline", "deadline")));
          setLocation(getField(project, "location", "location"));
          setPartner(getField(project, "partner", "partner"));
          setNotes(getField(project, "notes", "additional_notes"));
          setTasks(normalizeTasks(project.tasks || []));
        });
    }
  }, [project, open]);

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
    
    const staffInitials = taskStaff.length > 0 
      ? staffList.find(s => s.employee_id === taskStaff[0]) 
        ? `${staffList.find(s => s.employee_id === taskStaff[0]).first_name[0]}${staffList.find(s => s.employee_id === taskStaff[0]).last_name[0]}`.toUpperCase()
        : ""
      : "";
    
    setTasks([
      ...tasks,
      {
        name: taskInput,
        assignedStaff: taskStaff,
        staffInitials,
        deadline: taskDeadline,
        completed: false,
      },
    ]);
    setTaskInput("");
    setTaskStaff([]);
    setTaskDeadline("");
    setShowAddTask(false);
  };

  // Remove task
  const handleRemoveTask = (idx) => {
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  // Mark task complete/incomplete
  const handleTaskComplete = (idx, checked) => {
    setTasks(tasks.map((t, i) => i === idx ? { ...t, completed: checked } : t));
  };

  // Validation for all required fields except name and category
  const validate = () => {
  const newErrors = {};
  if (!startDate) newErrors.startDate = "Start Date is required";
  if (!deadline) newErrors.deadline = "Deadline is required";
  if (startDate && deadline && startDate > deadline) newErrors.startDate = "Start Date cannot be after Deadline";
  if (!location) newErrors.location = "Location is required";
  if (tasks.length === 0) newErrors.tasks = "At least one project task is required";
  // Only check task fields if tasks exist
  if (tasks.length > 0) {
    tasks.forEach((t, idx) => {
      if (!t.name) newErrors.tasks = `Task ${idx + 1}: Task name is required`;
      else if (!t.deadline) newErrors.tasks = `Task ${idx + 1}: Task deadline is required`;
      else if (t.deadline && (t.deadline < startDate || t.deadline > deadline)) {
        newErrors.tasks = `Task ${idx + 1}: Task deadline must be within project start and deadline dates`;
      }
    });
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const completedCount = tasks.filter(t => t.completed).length;
const percent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

let percentColor = "#e57373"; // light red
if (percent > 75) percentColor = "#388e3c"; // solid green
else if (percent > 50) percentColor = "#8bc34a"; // light green
else if (percent > 30) percentColor = "#ffa726"; // orange

<LinearProgress
  variant="determinate"
  value={percent}
  sx={{
    height: 8,
    borderRadius: 4,
    backgroundColor: "#eee",
    "& .MuiLinearProgress-bar": {
      backgroundColor: percentColor
    }
  }}
/>

  const handleSave = async () => {
    if (!validate()) {
  const firstError =
    (tasks.length === 0 && "A project must have at least one task.") ||
    errors.startDate ||
    errors.deadline ||
    errors.location ||
    errors.tasks ||
    "Please fill in all required fields.";
  setSnackbar({ open: true, message: firstError, severity: "error" });
  return;
}
    const updatedProject = {
      startDate,
      deadline,
      location,
      partner,
      additionalNotes: notes,
      tasks: tasks.map(t => ({
        name: t.name,
        staffId: t.assignedStaff && t.assignedStaff.length > 0 ? t.assignedStaff[0] : null,
        taskDeadline: t.deadline,
        completed: t.completed || false,
      })),
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // if using cookie-based sessions
      body: JSON.stringify(updatedProject)
      });
      if (response.ok) {
        setSnackbar({ open: true, message: "Project updated successfully!", severity: "success" });
        if (onSave) onSave();
        setTimeout(() => { if (onClose) onClose(); }, 1200);
      } else {
        const err = await response.json();
        setSnackbar({ open: true, message: err.error || "Failed to update project.", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to update project.", severity: "error" });
    }
  };

  // Reset form on close
  const handleClose = () => {
    if (project) {
      setStartDate(formatDate(getField(project, "startDate", "start_date")));
      setDeadline(formatDate(getField(project, "deadline", "deadline")));
      setLocation(getField(project, "location", "location"));
      setPartner(getField(project, "partner", "partner"));
      setNotes(getField(project, "notes", "additional_notes"));
      setTasks(normalizeTasks(project.tasks || []));
    }
    setTaskInput("");
    setTaskStaff([]);
    setTaskDeadline("");
    setShowAddTask(false);
    if (onClose) onClose();
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Edit Project Info
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Project Name"
              value={project?.title || ""}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Category"
              value={project?.category || ""}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate || ""}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              required
              error={!!errors.startDate}
              helperText={errors.startDate}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Deadline"
              type="date"
              value={deadline || ""}
              onChange={(e) => setDeadline(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              required
              error={!!errors.deadline}
              helperText={errors.deadline}
              inputProps={{
                min: startDate || undefined
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Location"
              value={location || ""}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
              margin="normal"
              required
              error={!!errors.location}
              helperText={errors.location}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Partner (optional)"
              value={partner || ""}
              onChange={(e) => setPartner(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Completion: {percent}%
                </Typography>
                <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#eee",
                    "& .MuiLinearProgress-bar": {
                    backgroundColor: percentColor
                    }
                }}
                />
            </Box>
            </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Project Tasks
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'stretch' }}>
              {tasks.length === 0 ? (
                <Grid item xs={12}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No tasks allocated yet.
                  </Typography>
                </Grid>
              ) : (
                tasks.map((task, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx} sx={{ display: 'flex' }}>
                    <Card
                      sx={{
                        background: "#23272f",
                        color: "#fff",
                        borderRadius: 2,
                        boxShadow: 3,
                        mb: 2,
                        position: "relative",
                        minHeight: 160,
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'stretch',
                        maxWidth: 320
                      }}
                    >
                      <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveTask(idx)}
                          sx={{ color: "#fff" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <CardContent sx={{ pb: "8px !important" }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {task.staffInitials && (
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background: "#1976d2",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: 16,
                                  ml: "auto"
                                }}
                              >
                                {task.staffInitials}
                              </Box>
                            )}
                          </Box>
                          <Checkbox
                            checked={!!task.completed}
                            onChange={e => handleTaskComplete(idx, e.target.checked)}
                            sx={{
                              color: "#4caf50",
                              '&.Mui-checked': { color: "#4caf50" }
                            }}
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{
                              flexGrow: 1,
                              textDecoration: task.completed ? "line-through" : "none",
                              color: "#fff",
                              fontWeight: 500,
                              fontSize: 16
                            }}
                          >
                            {task.name}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <span style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#ffb300"
                          }} />
                          <Typography variant="body2" sx={{ color: "#fff" }}>
                            {task.assignedStaff && task.assignedStaff.length > 0
                              ? task.assignedStaff
                                  .map(id => {
                                    const s = staffList.find(st => st.employee_id === id);
                                    return s ? `${s.first_name} ${s.last_name}` : id;
                                  })
                                  .join(", ")
                              : "Unassigned"}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            background: "#8bc34a",
                            color: "#23272f",
                            borderRadius: 4,
                            padding: "2px 8px",
                            fontWeight: 600,
                            fontSize: 13
                          }}>
                            <svg style={{ marginRight: 4 }} width="16" height="16" fill="none" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                            {task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : ""}
                          </span>
                          {!task.completed && task.deadline && new Date(task.deadline) < new Date() && (
                            <span style={{
                              color: "#ff5252",
                              fontWeight: 600,
                              marginLeft: 8
                            }}>Overdue</span>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
            {/* Add Task Button */}
            {!showAddTask && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddTask(true)}
                >
                  Add Task
                </Button>
              </Box>
            )}
            {/* Add Task Fields */}
            {showAddTask && (
              <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Task"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    fullWidth
                    error={!!errors.tasks}
                    helperText={errors.tasks}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Assign Staff</InputLabel>
                    <Select
                      multiple
                      value={taskStaff}
                      onChange={(e) => setTaskStaff(e.target.value)}
                      input={<OutlinedInput label="Assign Staff" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {selected.map((id) => {
                            const s = staffList.find((st) => st.employee_id === id);
                            return (
                              <Chip key={id} label={s ? `${s.first_name} ${s.last_name}` : id} />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {staffList.map((s) => (
                        <MenuItem key={s.employee_id} value={s.employee_id}>
                          {s.first_name} {s.last_name} ({s.email})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Task Deadline"
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddTask}
                    sx={{ height: 56, minWidth: 80, mt: { xs: 2, sm: 0 } }}
                    fullWidth
                  >
                    ADD
                  </Button>
                </Grid>
              </Grid>
            )}
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Additional Notes"
              value={notes || ""}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              margin="normal"
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ minWidth: 200, fontWeight: 600, fontSize: 18 }}
          >
            UPDATE PROJECT
          </Button>
        </Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2500}
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
      </Box>
    </Dialog>
  );
}