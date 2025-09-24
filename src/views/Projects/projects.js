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
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import ProjectsList from "./ProjectsList";
import CreateProject from "./CreateProject";
import UpdateProject from "./UpdateProject";
import ViewProject from "./ViewProject";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from "@mui/material/Dialog";

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
      const res = await fetch("/api/projects");
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
  const handleSaveProject = () => {
    setOpenCreate(false);
    setTimeout(() => {
      fetchProjects();
      setSnackbar({ open: true, message: 'Project created successfully!', severity: 'success' });
    }, 800); // Wait for backend to update, adjust as needed
  };

  const handleViewProject = (project) => {
  setViewProject(project);
  setSelectedProjectId(project.id); 
  setOpenView(true);
};
const handleCloseView = () => setOpenView(false);

  return (
    <Box sx={{ p: 4 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 8, mt: 0 }}>
        <Typography variant="h4" align="center">Projects</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 5,
          gap: 1,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
        }}
      >
        <TextField
          label="Search by filters"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 3, minWidth: 220, maxWidth: 400 }}
        />
        <FormControl size="small" sx={{ minWidth: 150, ml: 1 }}>
          <InputLabel>Sort by</InputLabel>
          <Select
            value={sortBy}
            label="Sort by"
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150, ml: 1 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            label="Category"
            onChange={(e) => setCategory(e.target.value)}
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
          sx={{
            py: 1.2,
            px: 6,
            ml: 1,
            fontWeight: 600,
            letterSpacing: 1,
            fontSize: 17,
            borderRadius: 2,
            minWidth: 260,
            background: 'linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)',
            boxShadow: '0 2px 8px #90caf9',
            transition: 'transform 0.18s, box-shadow 0.18s',
            textTransform: 'none',
            whiteSpace: 'nowrap',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 16px #90caf9',
              background: 'linear-gradient(90deg, #1565c0 60%, #42a5f5 100%)'
            }
          }}
          onClick={handleOpenCreate}
        >
          Create Project
        </Button>
      </Box>
      {loading ? (
        <Typography>Loading projects...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <ProjectsList projects={sortedProjects} onEdit={handleEditProject} onView={handleViewProject} />
      )}
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

export default Projects;