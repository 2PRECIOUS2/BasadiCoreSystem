import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  Button, 
  Avatar, 
  LinearProgress,
  Chip,
  Card,
  CardContent
} from "@mui/material";
import {
  Person as PersonIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import axios from "axios";
import { API_BASE_URL } from 'src/config';

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
    axios.get(`${API_BASE_URL}/api/employees/${employee.employee_id}/project-stats`, {
      withCredentials: true
    })
    .then(res => setProjectStats(res.data))
    .catch(() => setProjectStats({ projects: [], project_score: 0 }));
  }
}, [employee]);

  if (!employee) return null;

  const address = `${employee.street}, ${employee.city}, ${employee.province}, ${employee.postal_code}`;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const avatarColor = getRandomColor(employee.first_name + employee.last_name);

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      p: 4
    }}>
      <Paper sx={{ 
        p: 0, 
        maxWidth: 1200, 
        mx: "auto", 
        mt: 2,
        borderRadius: 3,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Enhanced Header Section */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 4,
          color: 'white',
          position: 'relative'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                bgcolor: avatarColor,
                width: 100,
                height: 100,
                fontSize: 42,
                fontWeight: 700,
                border: '4px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
              }}
            >
              {employee.first_name[0]}{employee.last_name[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                {employee.first_name} {employee.last_name}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: '500',
                mb: 2
              }}>
                {employee.role}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<PersonIcon sx={{ color: 'white !important' }} />}
                  label={`ID: ${employee.employee_id}`}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Chip
                  icon={<CalendarIcon sx={{ color: 'white !important' }} />}
                  label={`Born: ${formatDate(employee.date_of_birth)}`}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>
            
            {/* Project Score Circle */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                Project Score
              </Typography>
              <Box
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  border: `6px solid ${getScoreColor(projectStats.project_score)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 28,
                  color: getScoreColor(projectStats.project_score),
                  bgcolor: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                }}
              >
                {projectStats.project_score || 0}%
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Content Section */}
        <Box sx={{ p: 4 }}>

          {/* Contact Information Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <EmailIcon sx={{ fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Contact Details</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    📧 {employee.email}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    📱 {employee.cell_no}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                background: 'linear-gradient(145deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 8px 25px rgba(72, 187, 120, 0.3)'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <WorkIcon sx={{ fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Employment</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 1, opacity: 0.9 }}>
                    💼 {employee.employment_type} • {employee.employment_status}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    💰 R{employee.hourly_rate}/hour
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {/* Projects Work Section */}
          <Paper sx={{ 
            p: 3, 
            mb: 4,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
            <Typography variant="h6" sx={{ color: "#667eea", fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon /> Projects Work
            </Typography>
            {projectStats.projects.length === 0 && (
              <Typography variant="body2" sx={{ mb: 2, color: '#64748b' }}>No project data available.</Typography>
            )}
            {projectStats.projects.map((proj, idx) => (
              <Box key={proj.project_id} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Box sx={{
                    width: 20, height: 20, bgcolor: legendColors[idx % legendColors.length],
                    borderRadius: "6px", mr: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }} />
                  <Typography variant="body1" sx={{ minWidth: 160, fontWeight: '600', color: '#2d3748' }}>
                    {proj.project_name}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={proj.work_percentage}
                    sx={{
                      flex: 1,
                      mx: 3,
                      height: 12,
                      borderRadius: 6,
                      bgcolor: "rgba(0,0,0,0.1)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: legendColors[idx % legendColors.length],
                        borderRadius: 6
                      }
                    }}
                  />
                  <Typography variant="body1" sx={{ minWidth: 50, fontWeight: 'bold', color: '#2d3748' }}>
                    {Math.round(proj.work_percentage)}%
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>

          {/* Work Information and Location */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(145deg, #ed8936 0%, #dd7324 100%)',
                color: 'white',
                boxShadow: '0 8px 25px rgba(237, 137, 54, 0.3)'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon /> Work Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body1">
                    💰 <strong>Hourly Rate:</strong> R{employee.hourly_rate}
                  </Typography>
                  <Typography variant="body1">
                    📋 <strong>Employment Type:</strong> {employee.employment_type}
                  </Typography>
                  <Typography variant="body1">
                    ✅ <strong>Status:</strong> {employee.employment_status}
                  </Typography>
                  <Typography variant="body1">
                    📅 <strong>Hired:</strong> {formatDate(employee.hired_date)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(145deg, #9f7aea 0%, #805ad5 100%)',
                color: 'white',
                boxShadow: '0 8px 25px rgba(159, 122, 234, 0.3)'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon /> Location
                </Typography>
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 2, 
                  p: 1, 
                  minHeight: 140,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <iframe
                    title="map"
                    width="100%"
                    height="140"
                    frameBorder="0"
                    src={mapSrc}
                    style={{ border: 0, borderRadius: 8 }}
                    allowFullScreen
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        {/* Close Button */}
        <Box sx={{ p: 4, pt: 0, textAlign: "center" }}>
          <Button 
            variant="contained" 
            onClick={onClose}
            size="large"
            sx={{
              py: 1.5,
              px: 4,
              fontWeight: 'bold',
              borderRadius: 2,
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              textTransform: 'none',
              minWidth: 150,
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a67d8, #667eea)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            Close
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ViewEmployee;