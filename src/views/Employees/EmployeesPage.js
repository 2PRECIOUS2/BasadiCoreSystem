import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, Avatar, Card, CardContent, CardActions } from "@mui/material";
import AddEmployees from "./AddEmployees";
import EmployeesList from "./EmployeesList";
import UpdateEmployees from "./UpdateEmployees";
import ViewEmployee from "./ViewEmployee";
import axios from "axios";

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
    axios.get("/api/employees")
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
    await axios.put(`/api/employees/${editingEmployee.employee_id}`, form);
    // Refresh employees list
    const res = await axios.get("/api/employees");
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
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" sx={{ mb: 3 }}>
        Employees
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
        <Button
          variant="contained"
          color="warning"
          sx={{
            fontWeight: 600,
            fontSize: 18,
            px: 4,
            py: 1.2,
            borderRadius: 2,
            minWidth: 200,
          }}
          onClick={() => setOpenAdd(true)}
        >
          + Add Employee
        </Button>
      </Box>
    
      <AddEmployees
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSave={handleAddEmployee}
      />
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
    </Box>
    
  );
}

export default EmployeesPage;