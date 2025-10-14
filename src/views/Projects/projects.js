import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  Avatar,
  Divider,
  Chip
} from "@mui/material";
import {
  Add as AddIcon,
  Work as WorkIcon,
  FilterList as FilterIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import ProjectsList from "./ProjectsList";
import CreateProject from "./CreateProject";
import UpdateProject from "./UpdateProject";
import ViewProject from "./ViewProject";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from "@mui/material/Dialog";
import { API_BASE_URL } from 'src/config';
import withRoleProtection from '../../components/shared/withRoleProtection';
import PermissionGate from '../../components/shared/PermissionGate';
import { hasPermission, getUserDisplayInfo } from '../../utils/rbac';

const sortOptions = [
  { label: "Project Status", value: "status" },
  { label: "Name", value: "name" },
  { label: "Deadline", value: "deadline" },
  { label: "Category", value: "category" },
  { label: "Location", value: "location" },
];

const categories = [
  { label: "All", value: "all" },
  { label: "Training Program", value: "training" },
  { label: "Product Launching", value: "product" },
  { label: "Handicraft Program", value: "handicraft" },
  { label: "Speaker Program", value: "speaker" },
];



function sortProjects(projects, sortBy) {
  switch (sortBy) {
    case "name":
      return [...projects].sort((a, b) => a.title.localeCompare(b.title));
    case "deadline":
      return [...projects].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    case "category":
      return [...projects].sort((a, b) => a.category.localeCompare(b.category));
    case "location":
      return [...projects].sort((a, b) => a.location.localeCompare(b.location));
    case "status":
    default:
      return [...projects].sort((a, b) => a.status.localeCompare(b.status));
  }
}

export function Projects() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("status");
  const [openCreate, setOpenCreate] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openView, setOpenView] = useState(false);
  const [viewProject, setViewProject] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Fetch projects from backend

const fetchProjects = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await fetch(`${API_BASE_URL}/api/projects`, {
      credentials: 'include' // if you use sessions
    });
    if (!res.ok) throw new Error("Failed to fetch projects");
    const data = await res.json();
    setProjects(data);
  } catch (err) {
    setError(err.message || "Error fetching projects");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      p.title.toLowerCase().includes(search.toLowerCase())
  );

  const sortedProjects = sortProjects(filteredProjects, sortBy);

  // Handle create project dialog open/close
  const handleOpenCreate = () => setOpenCreate(true);
  const handleCloseCreate = () => setOpenCreate(false);

  const [openEdit, setOpenEdit] = useState(false);
const [selectedProject, setSelectedProject] = useState(null);

const handleEditProject = (project) => {
  setSelectedProject(project);
  setOpenEdit(true);
};
const handleCloseEdit = () => setOpenEdit(false);
const handleSaveEdit = () => {
  setOpenEdit(false);
  fetchProjects();
  setSnackbar({ open: true, message: 'Project updated successfully!', severity: 'success' });
};
  // After project creation, close dialog and refresh list
  const handleSaveProject = async (newProject) => {
    setOpenCreate(false);
    setRefreshing(true);
    try {
      // Refresh the projects list immediately after successful creation
      await fetchProjects();
      setSnackbar({ 
        open: true, 
        message: `Project "${newProject?.title || newProject?.projectName || 'New project'}" created and list updated successfully!`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error refreshing projects:', error);
      setSnackbar({ open: true, message: 'Project created but failed to refresh list. Please refresh manually.', severity: 'warning' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewProject = (project) => {
  setViewProject(project);
  setSelectedProjectId(project.id); 
  setOpenView(true);
};
const handleCloseView = () => setOpenView(false);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      p: 0
    }}>
      {/* Enhanced Header Section */}
      <Box sx={{ 
        bgcolor: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '3px solid #667eea',
        p: 4,
        mb: 0,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2 }}>
          <Avatar sx={{ 
            bgcolor: '#667eea', 
            width: 64, 
            height: 64,
            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)'
          }}>
            <WorkIcon sx={{ fontSize: 36, color: 'white' }} />
          </Avatar>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              color: 'transparent',
              mb: 1
            }}>
              Project Management
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#64748b',
              fontWeight: '500'
            }}>
              Plan, organize, and track your project workflows
            </Typography>
            {/* Role-based access info */}
            <Typography variant="body2" sx={{ 
              color: '#94a3b8',
              fontWeight: '400',
              mt: 1
            }}>
              Access Level: {getUserDisplayInfo()?.role || 'Unknown'} • Projects Module
            </Typography>
          </Box>
        </Box>

        {/* Enhanced Search and Filter Section */}
        <Paper sx={{ 
          p: 3, 
          mt: 3,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <FilterIcon sx={{ color: '#667eea', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
              Search & Filter Projects
            </Typography>
          </Box>
          <Divider sx={{ mb: 3, borderColor: '#667eea', borderWidth: 1 }} />
          
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
          }}>
            <TextField
              label="Search projects..."
              variant="outlined"
              size="medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#667eea', mr: 1 }} />
              }}
              sx={{ 
                flex: 2, 
                minWidth: 280,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#667eea', borderWidth: 2 },
                  '&.Mui-focused fieldset': { borderColor: '#667eea', borderWidth: 2 }
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
              }}
            />
            
            <FormControl size="medium" sx={{ minWidth: 180 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#48bb78', borderWidth: 2 },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#48bb78', borderWidth: 2 }
                }}
              >
                {sortOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="medium" sx={{ minWidth: 180 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
                sx={{
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ed8936', borderWidth: 2 },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ed8936', borderWidth: 2 }
                }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
              onClick={handleOpenCreate}
              sx={{
                py: 1.8,
                px: 4,
                fontWeight: 'bold',
                fontSize: 16,
                borderRadius: 2,
                minWidth: 200,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                textTransform: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a67d8, #6b46c1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                }
              }}
            >
              Create Project
            </Button>
          </Box>

          {/* Project Count Summary */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={`Total Projects: ${projects.length}`}
              sx={{ 
                bgcolor: '#667eea', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            />
            <Chip 
              label={`Filtered: ${sortedProjects.length}`}
              sx={{ 
                bgcolor: '#48bb78', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            />
            {category !== 'all' && (
              <Chip 
                label={`Category: ${categories.find(c => c.value === category)?.label}`}
                sx={{ 
                  bgcolor: '#ed8936', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              />
            )}
          </Box>
        </Paper>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ 
        p: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: 'calc(100vh - 280px)'
      }}>
        <Paper sx={{ 
          p: 4,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          minHeight: '400px'
        }}>
          {loading || refreshing ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '300px',
              flexDirection: 'column',
              gap: 2
            }}>
              <Avatar sx={{ 
                bgcolor: '#667eea', 
                width: 80, 
                height: 80,
                animation: 'pulse 2s infinite'
              }}>
                <WorkIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" sx={{ color: '#64748b' }}>
                {refreshing ? 'Updating projects...' : 'Loading projects...'}
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '300px',
              flexDirection: 'column',
              gap: 2
            }}>
              <Typography variant="h6" color="error" sx={{ textAlign: 'center' }}>
                {error}
              </Typography>
              <Button 
                variant="contained" 
                onClick={fetchProjects}
                sx={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a67d8, #6b46c1)'
                  }
                }}
              >
                Retry
              </Button>
            </Box>
          ) : (
            <ProjectsList projects={sortedProjects} onEdit={handleEditProject} onView={handleViewProject} />
          )}
        </Paper>
      </Box>
      
      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dialog Components */}
      <CreateProject
        open={openCreate}
        onClose={handleCloseCreate}
        onSave={handleSaveProject}
      />
      {selectedProject && (
      <UpdateProject
        open={openEdit}
        onClose={handleCloseEdit}
        project={selectedProject}
        onSave={handleSaveEdit}
      />
          )}
      {viewProject && (
  <Dialog
    open={openView}
    onClose={handleCloseView}
    maxWidth="md"
    fullWidth
    scroll="body"
    >
      <Box sx={{ p: 2 }}>
        <ViewProject projectId={selectedProjectId} />
      </Box>
    </Dialog>
  )}    
    </Box>
  );
}

export default withRoleProtection(Projects, 'projects');