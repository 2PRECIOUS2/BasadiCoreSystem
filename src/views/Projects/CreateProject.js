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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Slide,
  Chip,
  OutlinedInput,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { set } from "lodash";

// Project categories
const categories = [
  { label: "Training Program", value: "training" },
  { label: "Handicraft Program", value: "handicraft" },
  { label: "Product Launching", value: "product" },
  { label: "Speaker Program", value: "speaker" },
];

// Transition for full screen dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateProject({ open, onClose, onSave }) {
  // Form state
  const [projectName, setProjectName] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [partner, setPartner] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [errors, setErrors] = useState({});
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [taskStaff, setTaskStaff] = useState([]);
  const [taskDeadline, setTaskDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [staffList, setStaffList] = useState([]);

  // Fetch staff from backend
  useEffect(() => {
    fetch("/api/projects/employees")
      .then((res) => res.json())
      .then((data) => setStaffList(data))
      .catch(() => setStaffList([]));
  }, []);

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
    setTasks([
      ...tasks,
      {
        name: taskInput,
        assignedStaff: taskStaff,
        deadline: taskDeadline,
      },
    ]);
    setTaskInput("");
    setTaskStaff([]);
    setTaskDeadline("");
  };

  // Remove task
  const handleRemoveTask = (idx) => {
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  // Handle Save (submit)
  const validate = () => {
    const newErrors = {};
    if (!projectName) newErrors.projectName = "Project Name is required";
    if (!category) newErrors.category = "Category is required";
    if (!startDate) newErrors.startDate = "Start Date is required";
    if (startDate && deadline && startDate > deadline) newErrors.startDate = "Start Date cannot be after Deadline";
    tasks.forEach((t, idx) => {
      if (t.deadline && (t.deadline < startDate || t.deadline > deadline)) {
        newErrors.tasks = "Task deadlines must be within project start and deadline dates";
      }
    });

    if (!deadline) newErrors.deadline = "Deadline is required";
    if (!location) newErrors.location = "Location is required";
    if (tasks.length === 0) newErrors.tasks = "At least one project task is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
  if (!validate()) {
    setSnackbar({ open: true, message: "Please fill in all required fields.", severity: "error" });
    return;
  }
  const project = {
    projectName,
    category,
    startDate,
    deadline,
    location,
    partner,
    tasks: tasks.map(t => ({
      task: t.name,
      staffId: t.assignedStaff[0] || null,
      taskDeadline: t.deadline
    })),
    additionalNotes: notes,
    status: "active"
  };
  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project)
    });
    if (response.ok) {
      setSnackbar({ open: true, message: "Project created successfully!", severity: "success" });
      // Clear fields
      setProjectName("");
      setCategory("");
      setStartDate("");
      setDeadline("");
      setLocation("");
      setPartner("");
      setTasks([]);
      setTaskInput("");
      setTaskStaff([]);
      setTaskDeadline("");
      setNotes("");
      // Refresh project list in parent
      if (onSave) onSave();
      // Optionally close dialog after a short delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 1200);
    } else {
      const err = await response.json();
      setSnackbar({ open: true, message: err.error || "Failed to create project.", severity: "error" });
    }
  } catch (err) {
    setSnackbar({ open: true, message: "Failed to create project.", severity: "error" });
  }
};
   

  // Reset form on close
  const handleClose = () => {
    setProjectName("");
    setCategory("");
    setStartDate("");
    setDeadline("");
    setLocation("");
    setPartner("");
    setTasks([]);
    setTaskInput("");
    setTaskStaff([]);
    setTaskDeadline("");
    setNotes("");
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
            Create Project
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 4, maxWidth: 900, mx: "auto" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              fullWidth
              margin="normal"
              error={!!errors.projectName}
              helperText={errors.projectName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" error={!!errors.category}>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <Typography color="error" variant="caption">{errors.category}</Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
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
              value={deadline}
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
        </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Location"
              value={location}
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
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          {/* Project Tasks List */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Project Tasks
            </Typography>
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
            <List dense sx={{ mt: 1 }}>
              {tasks.map((task, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText
                    primary={task.name}
                    secondary={
                      <>
                        {task.assignedStaff.length > 0
                          ? "Assigned: " +
                            task.assignedStaff
                              .map(
                                (id) =>
                                  staffList.find((s) => s.employee_id === id)
                                    ? `${staffList.find((s) => s.employee_id === id).first_name} ${staffList.find((s) => s.employee_id === id).last_name}`
                                    : id
                              )
                              .join(", ")
                          : "Unassigned"}
                        <br />
                        Deadline: {task.deadline}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleRemoveTask(idx)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Additional Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              margin="normal"
            />
          </Grid>
        
        {/* Centered Save button at the bottom */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ minWidth: 200, fontWeight: 600, fontSize: 18 }}
          >
            SAVE
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