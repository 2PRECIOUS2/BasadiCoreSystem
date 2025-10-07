import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Avatar, 
  Card, 
  CardContent, 
  CardActions,
  Paper,
  Divider,
  Chip,
  Tooltip
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import AddEmployees from "./AddEmployees";
import EmployeesList from "./EmployeesList";
import UpdateEmployees from "./UpdateEmployees";
import ViewEmployee from "./ViewEmployee";
import axios from "axios";
import { API_BASE_URL } from 'src/config';
import withRoleProtection from '../../components/shared/withRoleProtection';
import PermissionGate from '../../components/shared/PermissionGate';
import { hasPermission, getUserDisplayInfo } from '../../utils/rbac';

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

function EmployeesPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);


  useEffect(() => {
  // Fetch employees from backend
  axios.get("/api/employees", { withCredentials: true })
    .then(res => {
      setEmployees(res.data);
    })
    .catch(err => {
      console.error("Failed to fetch employees:", err);
    });
}, []);

const handleEdit = (employee) => {
  setEditingEmployee(employee);
};

const handleUpdate = async (form) => {
  await axios.put(`/api/employees/${editingEmployee.employee_id}`, form, {
    withCredentials: true
  });
  
  // Refresh employees list
  const res = await axios.get("/api/employees", { withCredentials: true });
  setEmployees(res.data);
  setEditingEmployee(null);
};


  const handleCancel = () => {
    setEditingEmployee(null);
  };

  const handleAddEmployee = (employee) => {
    setEmployees([
      ...employees,
      {
        ...employee,
        id: employees.length + 1,
        hiredDate: new Date().toLocaleDateString(),
        color: "#b39ddb",
      },
    ]);
  };

  const handleView = (employee) => {
    setViewingEmployee(employee);
  };

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 3 }}>
          <Avatar sx={{ 
            bgcolor: '#667eea', 
            width: 64, 
            height: 64,
            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)'
          }}>
            <PeopleIcon sx={{ fontSize: 36, color: 'white' }} />
          </Avatar>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              color: 'transparent',
              mb: 1
            }}>
              Employee Management
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#64748b',
              fontWeight: '500'
            }}>
              Manage your team members and workforce
            </Typography>
            {/* Role-based access info */}
            <Typography variant="body2" sx={{ 
              color: '#94a3b8',
              fontWeight: '400',
              mt: 1
            }}>
              Access Level: {getUserDisplayInfo()?.role || 'Unknown'} • Employees Module
            </Typography>
          </Box>
        </Box>

        {/* Action Section */}
        <Paper sx={{ 
          p: 3,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BusinessIcon sx={{ color: '#667eea', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                Team Overview
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Chip 
                  label={`Total Employees: ${employees.length}`}
                  sx={{ 
                    bgcolor: '#667eea', 
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Chip 
                  label={`Active: ${employees.filter(e => e.employment_status === 'active').length}`}
                  sx={{ 
                    bgcolor: '#48bb78', 
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>
          </Box>
          
          <PermissionGate permission="employees">
            <Tooltip title="Add New Employee">
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                size="large"
                onClick={() => setOpenAdd(true)}
                sx={{
                  py: 1.8,
                  px: 4,
                  fontWeight: 'bold',
                  fontSize: 16,
                  borderRadius: 2,
                  minWidth: 200,
                  background: 'linear-gradient(45deg, #ed8936, #f6ad55)',
                  color: 'white',
                  textTransform: 'none',
                  boxShadow: '0 4px 16px rgba(237, 137, 54, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #dd7324, #ed8936)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(237, 137, 54, 0.4)'
                  }
                }}
              >
                Add Employee
              </Button>
            </Tooltip>
          </PermissionGate>
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
          minHeight: '500px'
        }}>
          <div>
            {viewingEmployee ? (
              <ViewEmployee
                employee={viewingEmployee}
                onClose={() => setViewingEmployee(null)}
              /> 
            ): editingEmployee ? (
            <UpdateEmployees
              employee={editingEmployee}
              onUpdate={handleUpdate}
              onCancel={handleCancel}
            />
          ) : (
            <EmployeesList
              employees={employees}
              onEdit={handleEdit}
              onView={handleView}
              // pass onView, onArchive as needed
            />
          )}
          </div>
        </Paper>
      </Box>
    
      {/* Add Employee Dialog */}
      <AddEmployees
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSave={handleAddEmployee}
      />
    </Box>
  );
}

// Protect the EmployeesPage with role-based access control (only super_admin and admin can access)
export default withRoleProtection(EmployeesPage, 'employees');