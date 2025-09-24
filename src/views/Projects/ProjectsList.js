import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  LinearProgress,
  Grid,
  Chip,
} from "@mui/material";


// Dummy images by category
const categoryImages = {
  training: "https://source.unsplash.com/400x200/?training,education",
  product: "https://source.unsplash.com/400x200/?product,launch",
  default: "https://source.unsplash.com/400x200/?project",
};

export function getImage(category) {
  return categoryImages[category] || categoryImages.default;
}

export function ProjectsList({ projects, onEdit, onView }) {
  return (
    <Grid container spacing={3}>
      {projects.map((project) => {
        const now = new Date();
        const startDate = new Date(project.start_date || project.startDate || project.startdate);
        const totalTasks = project.totalTasks || (project.tasks ? project.tasks.length : 0);
        const completedTasks = project.completedTasks !== undefined
          ? project.completedTasks
          : (project.tasks ? project.tasks.filter(t => t.completed).length : 0);

        // Progress calculation
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
         let progressBarColor = "#e57373"; // light red
        if (progress > 75) progressBarColor = "#388e3c"; // solid green
        else if (progress > 50) progressBarColor = "#8bc34a"; // light green
        else if (progress > 30) progressBarColor = "#ffa726"; // orange

        // Status calculation
        let status = "Not Started";
        if (totalTasks > 0) {
          if (completedTasks === totalTasks) {
            status = "Completed";
          } else if (completedTasks > 0) {
            status = "In Progress";
          } else if (now >= startDate) {
            status = "In Progress";
          }
        }

        let chipColor = "warning";
        let progressColor = "primary";
        if (status === "Completed") {
          chipColor = "success";
          progressColor = "success";
        } else if (status === "Not Started") {
          chipColor = "default";
          progressColor = "error";
        }

        return (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card sx={{ height: 390, display: "flex", flexDirection: "column" }}>
              <CardMedia
                component="img"
                height="140"
                image={project.image ? project.image : getImage(project.category)}
                alt={project.category}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 200 }}>
                
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 500, fontSize: 20, lineHeight: 1.2 }}>
                    {project.title}
                  </Typography>
                  <Chip label={status} color={chipColor} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Completed Tasks: <b>{completedTasks}/{totalTasks}</b>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Deadline: <b>{project.deadline ? project.deadline.slice(0, 10) : ""}</b>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Location: <b>{project.location}</b>
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      flexGrow: 1,
                      mr: 1,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#f5f5f5',
                      "& .MuiLinearProgress-bar1Determinate": {
                        backgroundColor: progressBarColor
                      }
                    }}
                  />
                  <Typography variant="body2">{progress}%</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => onView && onView(project)}>
                    View Details
                  </Button>
                  <Button size="small" variant="contained" onClick={() => onEdit && onEdit(project)}>
                    Edit Project Info
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default ProjectsList;