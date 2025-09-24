import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, Divider, Button, Avatar, LinearProgress } from "@mui/material";
import axios from "axios";

// Avatar colors
const avatarColors = [
  "#8e99f3", "#f48fb1", "#80cbc4", "#ffd54f",
  "#a1887f", "#90caf9", "#ce93d8", "#ffab91",
];
function getRandomColor(seed) {
  let idx = 0;
  if (seed) for (let i = 0; i < seed.length; i++) idx += seed.charCodeAt(i);
  return avatarColors[idx % avatarColors.length];
}
function getScoreColor(score) {
  if (score < 30) return "#e53935";
  if (score < 51) return "#ffb300";
  if (score < 76) return "#81c784";
  return "#388e3c";
}
function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

const legendColors = [
  "#8e99f3", "#81c784", "#ffd54f", "#f48fb1", "#ffab91", "#90caf9", "#ce93d8", "#a1887f"
];

const ViewEmployee = ({ employee, onClose }) => {
  const [projectStats, setProjectStats] = useState({ projects: [], project_score: 0 });

  useEffect(() => {
    if (employee?.employee_id) {
      axios.get(`/api/employees/${employee.employee_id}/project-stats`)
        .then(res => setProjectStats(res.data))
        .catch(() => setProjectStats({ projects: [], project_score: 0 }));
    }
  }, [employee]);

  if (!employee) return null;

  const address = `${employee.street}, ${employee.city}, ${employee.province}, ${employee.postal_code}`;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const avatarColor = getRandomColor(employee.first_name + employee.last_name);

  return (
    <Paper sx={{ p: 4, maxWidth: 1000, mx: "auto", mt: 4 }}>
      <Grid container spacing={2}>
        {/* Name above avatar, then info columns */}
        <Grid item xs={12} sm={8}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {employee.first_name} {employee.last_name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: avatarColor,
                width: 64,
                height: 64,
                fontSize: 28,
                fontWeight: 700,
                mr: 3,
              }}
            >
              {employee.first_name[0]}{employee.last_name[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Role: <span style={{ fontWeight: 400 }}>{employee.role}</span>
              </Typography>
              <Typography variant="body2">
                <b>Date of Birth:</b> {formatDate(employee.date_of_birth)}
              </Typography>
              <Typography variant="body2">
                <b>Employee ID:</b> {employee.employee_id}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2">
                <b>Email:</b> {employee.email}
              </Typography>
              <Typography variant="body2">
                <b>Mobile Phone:</b> {employee.cell_no}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#ff9800", mb: 1 }}>
                Project Score
              </Typography>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  border: `5px solid ${getScoreColor(projectStats.project_score)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 24,
                  color: getScoreColor(projectStats.project_score),
                  mx: "auto"
                }}
              >
                {projectStats.project_score || 0}%
              </Box>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />

          {/* Project bars and legend */}
          <Typography variant="subtitle2" sx={{ color: "#1976d2", fontWeight: 700, mb: 1 }}>
            Projects Work
          </Typography>
          {projectStats.projects.length === 0 && (
            <Typography variant="body2" sx={{ mb: 2 }}>No project data available.</Typography>
          )}
          {projectStats.projects.map((proj, idx) => (
            <Box key={proj.project_id} sx={{ mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{
                  width: 16, height: 16, bgcolor: legendColors[idx % legendColors.length],
                  borderRadius: "4px", mr: 1
                }} />
                <Typography variant="body2" sx={{ minWidth: 140 }}>
                  {proj.project_name}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={proj.work_percentage}
                  sx={{
                    flex: 1,
                    mx: 2,
                    height: 10,
                    bgcolor: "#eee",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: legendColors[idx % legendColors.length]
                    }
                  }}
                />
                <Typography variant="body2" sx={{ minWidth: 40 }}>
                  {Math.round(proj.work_percentage)}%
                </Typography>
              </Box>
            </Box>
          ))}
          {/* Legend */}
          <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 2 }}>
            {projectStats.projects.map((proj, idx) => (
              <Box key={proj.project_id} sx={{ display: "flex", alignItems: "center", mr: 3 }}>
                <Box sx={{
                  width: 16, height: 16, bgcolor: legendColors[idx % legendColors.length],
                  borderRadius: "4px", mr: 1
                }} />
                <Typography variant="caption">{proj.project_name}</Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Work Info and Location titles on same row */}
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ color: "#1976d2", fontWeight: 700, mb: 1 }}>
                Work Information
              </Typography>
              <Typography variant="body2">
                <b>Hourly Rate:</b> {employee.hourly_rate}
              </Typography>
              <Typography variant="body2">
                <b>Employment Type:</b> {employee.employment_type}
              </Typography>
              <Typography variant="body2">
                <b>Employment Status:</b> {employee.employment_status}
              </Typography>
              <Typography variant="body2">
                <b>Hired Date:</b> {formatDate(employee.hired_date)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ color: "#1976d2", fontWeight: 700, mb: 1 }}>
                Location
              </Typography>
              <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 1, minHeight: 120 }}>
                <iframe
                  title="map"
                  width="100%"
                  height="120"
                  frameBorder="0"
                  src={mapSrc}
                  style={{ border: 0, borderRadius: 8 }}
                  allowFullScreen
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, textAlign: "right" }}>
        <Button variant="outlined" onClick={onClose}>Close</Button>
      </Box>
    </Paper>
  );
};

export default ViewEmployee;