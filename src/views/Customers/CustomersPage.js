import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Modal,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import CustomerForm from './CustomerForm';
import CustomersList from './CustomersList';
import { API_BASE_URL } from '../../config';
import withRoleProtection from '../../components/shared/withRoleProtection';
import PermissionGate from '../../components/shared/PermissionGate';
import { hasPermission, getUserDisplayInfo } from '../../utils/rbac';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`Fetching customers from: ${API_BASE_URL}/api/customers`);
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 Frontend received data:', data);
      
      if (data.success) {
        if (data.data && data.data.length > 0) {
          console.log('📥 Sample customer received by frontend:', {
            id: data.data[0].id,
            customerNumber: data.data[0].customerNumber,
            firstName: data.data[0].firstName,
            lastName: data.data[0].lastName,
            fullName: data.data[0].fullName,
            email: data.data[0].email
          });
          console.log('📥 All keys in first received customer:', Object.keys(data.data[0]));
        }
        setCustomers(data.data || []);
        console.log('Customers loaded successfully:', data.data?.length || 0);
      } else {
        setError(data.message || 'Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      
      if (error.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Make sure the backend is running on port 5000.');
      } else {
        setError(error.message || 'Failed to connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setOpenModal(true);
    setError('');
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setOpenModal(true);
    setError('');
  };

  const handleArchiveCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to archive this customer?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCustomers(customers.filter(customer => customer.id !== customerId));
        setError('');
      } else {
        setError(data.message || 'Failed to archive customer');
      }
    } catch (error) {
      console.error('Error archiving customer:', error);
      setError('Failed to archive customer: ' + error.message);
    }
  };

  const handleFormSubmit = async (customerData) => {
    console.log('🎯 CustomersPage received form data:', customerData);
    
    try {
      let response;
      if (editingCustomer) {
        console.log(`📡 Making PUT request to: ${API_BASE_URL}/api/customers/${editingCustomer.id}`);
        response = await fetch(`${API_BASE_URL}/api/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(customerData),
        });
      } else {
        console.log(`📡 Making POST request to: ${API_BASE_URL}/api/customers`);
        response = await fetch(`${API_BASE_URL}/api/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(customerData),
        });
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Customer saved successfully');
        await fetchCustomers();
        setOpenModal(false);
        setError('');
      } else {
        setError(data.message || 'Failed to save customer');
      }
    } catch (error) {
      console.error('❌ Error saving customer:', error);
      setError('Failed to save customer: ' + error.message);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingCustomer(null);
    setError('');
  };

  const testServerConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        credentials: 'include'
      });
      if (response.ok) {
        console.log('✅ Server is reachable');
        fetchCustomers();
      } else {
        setError('Server is running but not responding correctly');
      }
    } catch (error) {
      console.error('❌ Server connection test failed:', error);
      setError('Cannot connect to server. Please start the backend server.');
    }
  };

  if (loading) {
    return (
      <PageContainer title="Customers" description="Manage your customers">
        <Box
          sx={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
              Loading customers...
            </Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Customers" description="Manage your customers">
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <Typography sx={{ fontSize: 32 }}>👥</Typography>
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: 'uppercase'
                }}
              >
                Customers
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16, mt: 0.5 }}>
                📊 Manage and track your customer information
              </Typography>
              {/* Role-based access info */}
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, mt: 1 }}>
                Access Level: {getUserDisplayInfo()?.role || 'Unknown'}
              </Typography>
            </Box>
          </Box>
          
          {/* Permission-gated Add Customer button */}
          <PermissionGate permission="customers">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddCustomer}
              sx={{
                py: 1.5,
                px: 3,
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: 16,
                borderRadius: 2,
                background: 'white',
                color: '#667eea',
                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                textTransform: 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(255, 255, 255, 0.4)',
                  background: 'white'
              }
            }}
          >
            New Customer
          </Button>
          </PermissionGate>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: 2
            }}
            onClose={() => setError('')}
            action={
              error.includes('server') || error.includes('connect') ? (
                <Button color="inherit" size="small" onClick={testServerConnection}>
                  Test Connection
                </Button>
              ) : null
            }
          >
            {error}
          </Alert>
        )}

        {/* Customers List in White Card */}
        <Paper
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}
        >
          <CustomersList
            customers={customers}
            onEdit={handleEditCustomer}
            onArchive={handleArchiveCustomer}
          />
        </Paper>
      </Box>

      {/* Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="customer-modal-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            width: { xs: '95%', sm: '90%', md: '850px' },
            maxHeight: '95vh',
            overflow: 'auto',
            outline: 'none',
            '&::-webkit-scrollbar': {
              width: '8px'
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#667eea',
              borderRadius: '10px'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#764ba2'
            }
          }}
        >
          <CustomerForm
            customer={editingCustomer}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
          />
        </Box>
      </Modal>
    </PageContainer>
  );
};

// Protect the CustomersPage with role-based access control
export default withRoleProtection(CustomersPage, 'customers');