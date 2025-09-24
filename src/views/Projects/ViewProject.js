import React, {useEffect, useState} from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  Divider,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// Helper for status circle with arrow
function StatusCircle({ status }) {
  let color = "#bdbdbd";
  let arrowRotation = 0;
  let icon = <RadioButtonUncheckedIcon sx={{ fontSize: 70, color }} />;
  if (status === "Completed") {
    color = "#43a047";
    icon = (
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CheckCircleIcon sx={{ fontSize: 70, color }} />
        <ArrowForwardIcon
          sx={{
            color,
            fontSize: 48,
            position: "absolute",
            top: 10,
            left: 10,
            transform: "rotate(0deg)",
          }}
        />
      </Box>
    );
  } else if (status === "In Progress") {
    color = "#ffa726";
    arrowRotation = 90;
    icon = (
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <RadioButtonUncheckedIcon sx={{ fontSize: 70, color }} />
        <ArrowForwardIcon
          sx={{
            color,
            fontSize: 48,
            position: "absolute",
            top: 10,
            left: 10,
            transform: `rotate(${arrowRotation}deg)`,
          }}
        />
      </Box>
    );
  } else if (status === "Not Started") {
    color = "#bdbdbd";
    arrowRotation = -90;
    icon = (
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <RadioButtonUncheckedIcon sx={{ fontSize: 70, color }} />
        <ArrowForwardIcon
          sx={{
            color,
            fontSize: 48,
            position: "absolute",
            top: 10,
            left: 10,
            transform: `rotate(${arrowRotation}deg)`,
          }}
        />
      </Box>
    );
  }
  return icon;
}

// Helper for colored avatar backgrounds
const avatarColors = ["#43a047", "#1976d2", "#8e24aa", "#fbc02d", "#e53935", "#00897b", "#ff7043", "#7e57c2"];

function stringAvatar(name, color) {
  return {
    sx: {
      bgcolor: color,
      width: 48,
      height: 48,
      fontSize: 22,
      fontWeight: 700,
    },
    children: name
      .split(" ")
      .map((n) => n[0])
      .join(""),
  };
}

export default function ViewProject({ projectId }) {
  const [project, setProject] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    fetch(`http://localhost:5000/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        console.log('Project data with orders:', data);
        setProject(data);
      })
      .catch(err => console.error('Error fetching project:', err));
  }, [projectId]);

  if (!project) return null;

  let status = project.status || "Not Started";
  if (project.totalTasks > 0) {
    if (project.completedTasks === project.totalTasks) status = "Completed";
    else if (project.completedTasks > 0) status = "In Progress";
    else status = "Not Started";
  }

  // Team involved (unique staff from tasks)
  const team = (project.tasks || [])
    .map((t) => ({
      initials: t.staffInitials,
      name: `${t.firstName} ${t.lastName}`,
      role: t.role || t.staffRole || "Staff",
    }))
    .filter((t, idx, arr) => t.initials && arr.findIndex(x => x.initials === t.initials) === idx);

  const statusColors = {
    'pending': 'warning',
    'delivered': 'success',
    'cancelled': 'error',
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Card sx={{ borderRadius: 4, boxShadow: 3, p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 700, color: "#1976d2" }}>
            {project.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <StatusCircle status={status} />
            <Typography
              variant="h6"
              sx={{
                ml: 1,
                fontWeight: 700,
                color:
                  status === "Completed"
                    ? "#43a047"
                    : status === "In Progress"
                    ? "#ffa726"
                    : "#bdbdbd",
              }}
            >
              {status}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          {project.category}
        </Typography>
        <Divider sx={{ my: 2 }} />

        {/* NEW: Project Financial Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            {/* <AttachMoneyIcon sx={{ mr: 1, color: '#1976d2' }} /> */}
            Project Financial Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ p: 3, textAlign: 'center', bgcolor: '#e3f2fd', borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <ShoppingCartIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mb: 1 }}>
                  {project.totalOrders || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Total Orders
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ p: 3, textAlign: 'center', bgcolor: '#e8f5e8', borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Typography variant="h2" sx={{ fontSize: 40, color: '#43a047', fontWeight: 700 }}>
                    R
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#43a047', mb: 1 }}>
                  R{(project.totalSpent || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Total Spent
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card sx={{ p: 3, textAlign: 'center', bgcolor: '#fff3e0', borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <Typography variant="h2" sx={{ fontSize: 40, color: '#f57c00', fontWeight: 700 }}>
                    R
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f57c00', mb: 1 }}>
                  R{project.totalOrders > 0 ? (project.totalSpent / project.totalOrders).toFixed(2) : '0.00'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Average per Order
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Order Details Toggle */}
          {project.totalOrders > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} 
                   onClick={() => setShowOrderDetails(!showOrderDetails)}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>
                  Order Details ({project.totalOrders} orders)
                </Typography>
                <IconButton size="small">
                  {showOrderDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              
              <Collapse in={showOrderDetails}>
                <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order #</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(project.ordersList || []).map((order) => (
                        <TableRow key={order.orderno}>
                          <TableCell>{order.orderno}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell align="right">R{order.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              color={statusColors[order.status] || 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 
                             new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Collapse>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Existing Project Information */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b style={{ color: "#43a047" }}>Start Date:</b>{" "}
              <span style={{ color: "#43a047" }}>{project.start_date?.toString().slice(0, 10)}</span>
            </Typography>
            <Typography>
              <b style={{ color: "#e53935" }}>Deadline:</b>{" "}
              <span style={{ color: "#e53935" }}>{project.deadline?.toString().slice(0, 10)}</span>
            </Typography>
            <Typography>
              <b>Location:</b>
              <br />
              <span style={{ whiteSpace: "pre-line" }}>{project.location}</span>
            </Typography>
            <Typography>
              <b>Partner:</b> {project.partner}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>
              <b>Category:</b> {project.category}
            </Typography>
            <Typography>
              <b>Notes:</b> {project.notes || "-"}
            </Typography>
          </Grid>
        </Grid>

        {/* Rest of existing content (Tasks and Team sections remain the same) */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Tasks
        </Typography>
        <Box sx={{ mb: 2 }}>
          {(project.tasks || []).length === 0 ? (
            <Typography color="text.secondary">No tasks allocated yet.</Typography>
          ) : (
            <Grid container spacing={2} alignItems="stretch">
              {project.tasks.map((task, idx) => (
                <Grid item xs={12} sm={6} md={4} key={task.id || idx} sx={{ display: 'flex' }}>
                  <Card
                    sx={{
                      background: "#f5f5f5",
                      borderRadius: 2,
                      boxShadow: 1,
                      p: 2,
                      minHeight: 200,
                      height: '100%',
                      width: '100%',
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "space-between"
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: avatarColors[idx % avatarColors.length],
                          mr: 1,
                          width: 56,
                          height: 56,
                          fontSize: 24,
                          fontWeight: 700
                        }}
                      >
                        {task.staffInitials || "NA"}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{task.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {task.firstName} {task.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {task.role || "Staff"}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <b>Deadline:</b> {" "}
                      <span style={{ color: "#e53935" }}>{task.taskDeadline?.toString().slice(0, 10)}</span>
                    </Typography>
                    <Chip
                      label={task.completed ? "Completed" : "Pending"}
                      size="small"
                      sx={{
                        bgcolor: task.completed ? "#43a047" : "#ffa726",
                        color: "#fff",
                        fontWeight: 600,
                        mt: 0.5,
                        fontSize: 16,
                        height: 32,
                      }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Team Involved
        </Typography>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 4 }}>
          {team.length === 0 ? (
            <Typography color="text.secondary">No team members assigned.</Typography>
          ) : (
            team.map((member, idx) => (
              <Box key={idx} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Avatar
                  sx={{
                    bgcolor: avatarColors[idx % avatarColors.length],
                    width: 56,
                    height: 56,
                    fontSize: 22,
                    fontWeight: 700,
                    mb: 1
                  }}
                >
                  {member.initials}
                </Avatar>
                <Typography sx={{ fontWeight: 600 }}>{member.initials}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {member.role}
                </Typography>
              </Box>
            ))
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1976d2" }}>
            Managed by: Lynette Johnson
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}